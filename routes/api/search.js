const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const escape_html = require('escape-html');

// // Load Search Validation
// const validateQuestionInput = require('../../validation/question')

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


// @route   GET api/search/:key
// @desc    Search for a user or question
// @access  public
router.get('/:key', (req, res) => {
  //search the users and question tables for matching keys
  const key = req.params.key.toLowerCase();
  const errors = {};
  const results = {};
  User.find({}, {name: 1, avatar: 1})
    .then(users => {
      if (!users) results.users = [];
      const found = users.filter(user => {
        // ill have to limit the display to show only a few results
        // search has to be optimized to search by keywords, not the whole search key
        // propbably look for a search library
        if (user.name.toLowerCase().indexOf(key) !== -1) return user;
      });
      if (found.length > 0) {
        results.users = found;
      } else {
        results.users = [];
      }

      Question.find({}, {question_title: 1, slug: 1})
        .then(questions => {
          if (!questions) {
            results.questions = [];
            return res.json(results);
          }

          const found = questions.filter(question => {
            // ill have to limit the display to show only a few results
            // search has to be optimized to search by keywords, not the whole search key
            // propbably look for a search library
            if (question.question_title.toLowerCase().indexOf(key) !== -1) return question;
          });

          if (found.length > 0) {
            results.questions = found;
          } else {
            results.questions = [];
          }
          return res.json(results);

        })

    }).catch(err => console.log(err))
  })

module.exports = router;
