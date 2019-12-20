const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const escape_html = require('escape-html');
const axios = require('axios');
const slugify = require('slugify');

const notify = require('../../functions/Notify');
let notifyFor = {};


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

// @route   GET api/admin/overview
// @desc    Tests question route
// @access  public
router.get('/overview', passport.authenticate('jwt', { session: false }), (req, res) => {
  //if(req.user.status !== 7) res.status(400).json({error: 'Not Admin'});
  let data = {};
  Profile.find()
    .populate('user', ['name', 'avatar', 'email', 'date'])
    .then(profiles => {
      data.profiles = profiles.reverse();
      Question.find()
        .populate({
          path: 'user answers.answer answers.answer',
          populate: {
            path: 'user comments.user'
          }
        })
        .then(questions => {
          data.questions = questions.reverse();
          Answer.find()
            .populate({
              path: 'user answers.answer answers.answer',
              populate: {
                path: 'user comments.user'
              }
            })
            .then(answers => {
              data.answers = answers.reverse();
              res.json(data);
            })
        })
    })
})

// @route   POST api/admin/delete/user/:id
// @desc    Delete a question
// @access  private
router.delete('/delete/user/:id', passport.authenticate('jwt', { session: false}), (req, res) => {
  if(req.user.status !== 7) res.status(400).json({error: 'Unauthorized'})
  User.findById(req.params.id)
    .then(user => {
      User.remove({id: req.params.id}).then(msg => {
        Profile.remove({user: req.params.id})
          .then(msg => res.json(msg))
      });
    })
  })


module.exports = router;
