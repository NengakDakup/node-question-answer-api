const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const escape_html = require('escape-html');

// Load Input Validation
const validateQuestionInput = require('../../validation/question')

// Load Question Model
const Question = require('../../models/Question');
// Load Profile Model
const Profile = require('../../models/Profile');
// Load User Model
const User = require('../../models/User');
// Load Answer Model
const Answer = require('../../models/Answer');

// @route   GET api/question/test
// @desc    Tests question route
// @access  public
router.get('/test', (req, res) => res.json({msg: 'question Works!'}));


// @route   GET api/question/:id
// @desc    Gets a particular question by id
// @access  public
router.get('/:id', (req, res) => {
  const errors = {};
  Question.findOne({_id: req.params.id})
    .populate('user', ['name', 'avatar'])
    .then(question => {
      if(!question) return res.status(400).json({noquestion: 'Question Not found'});
      return res.json(question);
    })
    .catch(err => res.json({noquestion: 'Question not found'}));
})

// @route   GET api/question
// @desc    Gets all questions
// @access  public
router.get('/', (req, res) => {
  const errors = {};
  Question.find()
    .populate('user', ['name', 'avatar'])
    .then(questions => {
      if(!questions) {
        errors.noquestions = 'There are no questions';
        return res.status(404).json(errors);
      }

      return res.json(questions);
    })
    .catch(err => res.status(404).json({noquestions: 'There are no questions'}));
});

// @route   POST api/question/create
// @desc    Create or Edit user question
// @access  private
router.post('/create', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Validate the inputs
  const {errors, isValid} = validateQuestionInput(req.body);
  // Check Validation Errors
  if (!isValid) {
      return res.status(400).json(errors);
  }

  // Handle the upload of the image here

  // Get all the fields entered
  const questionFields = {};
  questionFields.user = req.user.id;
  if(req.body.question_title) questionFields.question_title = req.body.question_title;
  if(req.body.question_title) questionFields.slug = req.body.question_title.toLowerCase().split(" ").join("-").replace( "?", "");
  if(req.body.category_id) questionFields.category_id = req.body.category_id;
  if(req.body.tags) questionFields.tags = req.body.tags;
  if(req.body.body) questionFields.body = req.body.body;
  if(req.body.image) questionFields.image = req.body.image; //link to the image is th uploaded url

  // Check if user exists
  Profile.findOne({user: req.user.id}).then(profile => {
    // Check if question-slug exists
    Question.findOne({slug: questionFields.slug}).then(question => {
      if (question){
        // Check if question was created by the user
        if (question.user == req.user.id) {
          // Update the question
          Question.findOneAndUpdate(
            { user: req.user.id},
            { $set: questionFields },
            { new: true}
          ).populate('user', ['name', 'avatar']).then(question => res.json(question)).catch(err => console.log(err))
        } else {
          errors.alreadyexists = 'Question already exists';
          return res.status(400).json(errors);
        }

      } else {
        // Save the question
        new Question(questionFields).save()
          .then(question => {
            res.json(question)
          })
          .catch(err => console.log(err));

      }

    }).catch(err => console.log(err));
  }).catch(err => res.json({nouser: 'User does not exist'}));

})

// @route   POST api/question/delete/:id
// @desc    Delete a question
// @access  private
router.delete('/delete/:id', passport.authenticate('jwt', { session: false}), (req, res) => {
  // first check if user profile exists
  Profile.findOne({user: req.user.id}).then(profile => {
    Question.findOne({_id: req.params.id})
      .then(question => {
        Question.remove({_id: req.params.id}).then(msg => res.json(msg));
      })
  })
})

// @route   POST api/question/like/:id
// @desc    Like/Unlike a question
// @access  private
router.post('/like/:id', passport.authenticate('jwt', { session: false}), (req, res) => {
  Profile.findOne({user: req.params.id}).then(profile => {
    Question.findById(req.params.id).then(question => {
      // check if question exists
      if(!question) res.json({noquestion: 'Question not found'})
      // check if post is liked or not, then act accordingly
      if (question.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
        // Get the remove index
        const removeIndex = question.likes.map(item => item.user.toString()).indexOf(req.user.id);
        // Splice it out of the array
        question.likes.splice(removeIndex, 1);
        // Save the post
        question.save().then(question => res.json(question));
      } else {
        //Add user likes to the array
        question.likes.unshift({user: req.user.id});
        question.save().then(post => res.json(post));
      }
    }).catch(err => res.json({noquestion: 'Question not found'}));
  }).catch(err => res.json({nouser: 'User not found'}));
})


module.exports = router;
