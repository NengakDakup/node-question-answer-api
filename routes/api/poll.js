const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Input Validation
const validateProfileInput = require('../../validation/profile')

// Load Profile Model
const Profile = require('../../models/Profile');
// Load User Model
const User = require('../../models/User');
// load Poll Model
const Poll = require('../../models/Poll');



const notify = require('../../functions/Notify');
let notifyFor = {};

// @route   GET api/poll/test
// @desc    Tests poll route
// @access  public
router.get('/test', (req, res) => res.json({msg: 'poll Works!'}));

// @route   GET api/poll/create
// @desc    Create a poll
// @access  private
router.post('/create', passport.authenticate('jwt', {session: false}), (req, res) => {
  const errors = {};
  User.findById(req.user.id).then(user => {
    if(!user) return res.status(400).json({error: "User not Found"});

    // get all the poll Fields
    let pollFields = {};
    pollFields.user = req.user.id;
    const {title, body, image, options} = req.body;
    pollFields.title = title;
    pollFields.body = body;
    pollFields.image = image;
    pollFields.options = options;

    // Save the question
    new Poll(pollFields)
    .save()
      .then(poll => {
        res.json(poll);
      })

  })
});

// @route   GET api/poll/delete
// @desc    Delete a poll
// @access  private
router.post('/delete', passport.authenticate('jwt', {session: false}), (req, res) => {
  const erroers = {};
  User.findById(req.user.id).then(user => {
    if(!user) return res.status(404).json({error: 'User not Found'});

    const {pollID} = req.body;
    Poll.findById(pollID).then(poll => {
      if(!poll) return res.status(404).json({error: 'Poll does not exist'});
      Poll.remove({_id: pollID}).then(msg => res.json(msg));
    })
  })
})

// @route   GET api/poll/vote
// @desc    Vote a poll option
// @access  private
router.post('/vote', passport.authenticate('jwt', {session: false}), (req, res) => {
  const errors = {};
  // implement the poll voting functionality
})

// @route   GET api/poll/unvote
// @desc    Unvote a poll option
// @access  private
router.post('/unvote', passport.authenticate('jwt', {session: false}), (req, res) => {
  const errors = {};
  // implement the poll unvoting functionality
})




module.exports = router;
