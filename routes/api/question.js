const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const escape_html = require('escape-html');
const axios = require('axios');
var multer  = require('multer')
const slugify = require('slugify');
var upload = multer({ dest: '../../uploads/' })


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
// Load Report Model
const Reported = require('../../models/Reported')

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
    .populate('user answer')
    .then(question => {
      if(!question) return res.status(400).json({noquestion: 'Question Not found'});
      return res.json(question);
    })
    .catch(err => res.json({noquestion: 'Question not found'}));
})

// @route   GET api/question/slug/:slug
// @desc    Gets a particular question by slug
// @access  public
router.get('/slug/:slug', (req, res) => {
  const errors = {};
  Question.findOne({slug: req.params.slug})
    .populate('user answer')
    .then(question => {
      if(!question) return res.status(400).json({noquestion: 'Question Not found'});
      return res.json(question);
    })
    .catch(err => res.status(404).json({noquestion: 'Question not found'}));
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

      return res.json(questions.reverse());
    })
    .catch(err => res.status(404).json({noquestions: 'There are no questions'}));
});

// @route   POST api/question/create
// @desc    Create or Edit user question
// @access  private
router.post('/create', upload.single('image'), passport.authenticate('jwt', { session: false }), (req, res) => {
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
  if(req.body.question_title) questionFields.slug = slugify(req.body.question_title.toLowerCase(), {remove: /[*+~.,()'"!?:@]/g});
  if(req.body.category) questionFields.category = req.body.category;
  if(req.body.tags) questionFields.tags = req.body.tags;
  if(req.body.body) questionFields.body = req.body.body;
  if(req.body.image) questionFields.image = req.body.image; //link to the image is th uploaded url

  // Check if user exists
  Profile.findOne({user: req.user.id}).then(profile => {
    // Check if question-slug exists
    Question.findOne({slug: questionFields.slug})
    .populate('user')
    .then(question => {
      if (question){
        // Check if question was created by the user
        if (question.user._id.toString() === req.user.id.toString()) {
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
    // wtf i need to check if the question was posted by the user
    Question.findOne({_id: req.params.id})
      .populate('user')
      .then(question => {
        // Check if question was posted by user
        if ( question.user._id.toString() === req.user.id.toString() ) {
          Question.remove({_id: req.params.id}).then(msg => res.json(msg));
        } else {
          return res.status(400).json({unauthorized: 'Unauthorized'});
        }
      })
  })
})

// @route   POST api/question/like/:id
// @desc    Like/Unlike a question
// @access  private
router.post('/like/:id', passport.authenticate('jwt', { session: false}), (req, res) => {
  Profile.findOne({user: req.user.id}).then(profile => {
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

// @route   POST api/question/approve
// @desc    Approve an answer as correct
// @access  private
router.post('/approve', passport.authenticate('jwt', {session: false}), (req, res) => {
  User.findById(req.user.id).then(user => {
    const errors = {};
    if(!user){
      errors.nouser = 'User not Found';
      return res.status(404).json(errors);
    }
    const {questionId, answerId} = req.body;
    Question.findById(questionId)
    .populate('user')
    .then(question => {
      if(!question){
        errors.noquestion = 'Question not Found';
        return res.status(404).json(errors);
      }

      if(question.user._id.toString() !== req.user.id.toString()){
        errors.unauthorized = 'Unauthorized';
        return res.status(404).json(errors);
      }

      if(question.answers.filter(answer => answer.answer.toString() === answerId).length < 1){
        errors.noanswer = 'Answer not found';
        return res.status(404).json(errors);
      }

      question.best_answer = answerId;
      question.save().then(question => res.json(question));
    })

  })
})

// @route   POST api/question/report/:id
// @desc    Report a question
// @access  private
router.post('/report/:id', passport.authenticate('jwt', { session: false}), (req, res) => {
  User.findById(req.user.id).then(user => {
    const errors = {};
    if(!user) {
      errors.nouser = 'User not Found';
      return res.status(404).json(errors);
    }
    // check if question exists
    Question.findById(req.params.id).then(question => {
      if(!question) {
        errors.noquestion = 'Question not found';
        return res.status(404).json(errors);
      }

      // set the report fileds
      const reportFields = {};
      reportFields.type = 'question';
      reportFields.id = req.params.id;
      reportFields.user = req.user.id;

      // Save the report
      new Reported(reportFields).save().then(reported => res.json(reported));

    }).catch(err => res.json(err))
  })
})


module.exports = router;
