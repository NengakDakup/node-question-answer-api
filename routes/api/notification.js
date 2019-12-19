const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Input Validation
const validateAnswerInput = require('../../validation/answer');
const validateCommentInput = require('../../validation/comment');
const notify = require('../../functions/Notify');
let notifyFor = {};

// Load Question Model
const Question = require('../../models/Question');
// Load Profile Model
const Profile = require('../../models/Profile');
// Load User Model
const User = require('../../models/User');
// Load Answer Model
const Answer = require('../../models/Answer');
// Load Notification Model
const Notification = require('../../models/Notification');

// @route   POST api/notification/all
// @desc    Get all notifications for a user
// @access  private
router.get('/all', passport.authenticate('jwt', { session: false }), (req, res) => {
  Notification.find({user: req.user.id})
    .then(notifications => {
      if(!notifications) res.status(404).json({nonotification: 'You have no Notifications'})
      res.json(notifications.reverse());
    })
})

// @route   GET api/notification/markseen
// @desc    Mark all notifications as seen for a user
// @access  private
router.get('/markseen', passport.authenticate('jwt', { session: false }), (req, res) => {
  Notification.updateMany(
    {user: req.user.id},
    {$set: {seen: true}}
  ).then(ans => res.json(ans))
})

// @route   GET api/notification/markread/:id
// @desc    Mark a notifications as read for a user
// @access  private
router.get('/markread/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Notification.updateOne(
    {_id: req.params.id},
    {$set: {read: true}}
  ).then(ans => res.json(ans))
})

// @route   GET api/notification/markallread
// @desc    Mark a notifications as read for a user
// @access  private
router.get('/markallread', passport.authenticate('jwt', { session: false }), (req, res) => {
  Notification.updateMany(
    {user: req.user.id},
    {$set: {read: true}}
  ).then(ans => res.json(ans))
})



module.exports = router;
