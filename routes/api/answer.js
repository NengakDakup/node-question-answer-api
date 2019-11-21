const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Input Validation
const validateAnswerInput = require('../../validation/answer')

// Load Question Model
const Question = require('../../models/Question');
// Load Profile Model
const Profile = require('../../models/Profile');
// Load User Model
const User = require('../../models/User');
// Load Answer Model
const Answer = require('../../models/Answer');

// @route   GET api/answer/test
// @desc    Tests answer route
// @access  public
router.get('/test', (req, res) => res.json({msg: 'answer Works!'}));

// @route   POST api/answer/create
// @desc    Create or Edit an answer
// @access  private
router.post('/create', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Validate the inputs
  const {errors, isValid} = validateAnswerInput(req.body);
  // Check Validation Errors
  if (!isValid) {
      return res.status(400).json(errors);
  }

  const answerFields = {};
  answerFields.user = req.user.id;
  if(req.body.body) answerFields.body = req.body.body;
  if(req.body.question_id) answerFields.question = req.body.question_id;

  //check if user exists
  // Check if user exists
  Profile.findOne({user: req.user.id}).then(profile => {
    // Check if question-slug exists
    Question.findOne({_id: answerFields.question}).then(question => {
      if (question){
        // Check if question was created by the user
        // Save the question
        new Answer(answerFields).save()
          .then(answer => {
            //Add answer to the questions array
            question.answers.unshift({answer: answer._id});
            question.save().then(question => res.json(question));
          })
          .catch(err => console.log(err));

      } else {
        // question does not exist
        errors.noquestion = 'Question does not exist';
        return res.status(404).json(errors);

      }

    }).catch(err => console.log(err));
  }).catch(err => res.json({nouser: 'User does not exist'}));

})

// @route   POST api/answer/upvote
// @desc    Create or Edit an answer
// @access  private
router.post('/upvote', passport.authenticate('jwt', { session: false }), (req, res) => {
  //check if question is already upvoted
  //check if user downvoted the question
  //if question was downvoted, remove from the downvotes array
  //then add to the upvotes array
})

module.exports = router;
