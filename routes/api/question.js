const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Input Validation
const validateQuestionInput = require('../../validation/question')

// Load Question Model
const Question = require('../../models/Question');
// Load Profile Model
const Profile = require('../../models/Profile');
// Load User Model
const User = require('../../models/User');

// @route   GET api/question/test
// @desc    Tests question route
// @access  public
router.get('/test', (req, res) => res.json({msg: 'question Works!'}));

// @route   GET api/question/all
// @desc    Gets all questions
// @access  public
router.get('/all', (req, res) => {
  const errors = {};
  Question.find()
    // .populate('user', ['name', 'avatar'])
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
        ).then(question => res.json(question))
      } else {
        errors.alreadyexists = 'Question already exists';
        return res.status(400).json(errors);
      }



    } else {
      // Save the question
      new Question(questionFields).save().then(question => res.json(question));

    }

  })


})

// @route   POST api/question/delete/:id
// @desc    Delete a question
// @access  private
router.delete('/delete/:id', passport.authenticate('jwt', { session: false}), (req, res) => {
  Question.findOne({_id: req.params.id})
    .then(question => {
      res.json(question);
    })
})


module.exports = router;
