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

// @route   POST api/answer/:id
// @desc    Create or Edit an answer
// @access  private
router.post('/create/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Validate the inputs
  const {errors, isValid} = validateAnswerInput(req.body);
  // Check Validation Errors
  if (!isValid) {
      return res.status(400).json(errors);
  }

  const answerFields = {};
  answerFields.user = req.user.id;
  if(req.body.body) answerFields.body = req.body.body;
  if(req.body.question_title) answerFields.slug = req.body.question_title;

  //

})

module.exports = router;
