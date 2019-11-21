const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Input Validation
const validateAnswerInput = require('../../validation/answer');
const validateCommentInput = require('../../validation/comment');

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
  User.findOne({_id: req.user.id}).then(profile => {
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

// @route   POST api/answer/upvote/:id
// @desc    Upvote an answer
// @access  private
router.post('/upvote/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const errors = {};
  //check if user profile exists
  User.findOne({_id: req.user.id}).then(profile => {
    Answer.findOne({_id: req.params.id}).then(answer => {
      if(!answer) res.json({noanswer: 'Answer not found'});
        //check if question is already upvoted
        if(answer.upvotes.filter(upvote => upvote.user.toString() === req.user.id).length > 0){
          //upvoted already:
          return res.json({alreadyupvoted: 'Answer already upvoted'});
        } else {
          //check if user downvoted the question
          if(answer.downvotes.filter(downvote => downvote.user.toString() === req.user.id).length > 0){
            //remove the downvote first
            // Get the remove index
            const removeIndex = answer.downvotes.map(item => item.user.toString()).indexOf(req.user.id);
            // Splice it out of the array
            answer.downvotes.splice(removeIndex, 1);
            // Add the user to the upvotes array
            answer.upvotes.unshift({user: req.user.id});
            // save the downvotes
            answer.save().then(answer => res.json(answer));
          } else {
            // Add the user to the upvotes array
            answer.upvotes.unshift({user: req.user.id});
            // save the downvotes
            answer.save().then(answer => res.json(answer));
          }
        }
    }).catch(err => res.json({noanswer: 'Answer does not exist'}))
  }).catch(err => res.json({nouser: 'User does not exist'}))
})


// @route   POST api/answer/downvote/:id
// @desc    Downvote an answer
// @access  private
router.post('/downvote/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const errors = {};
  //check if user profile exists
  User.findOne({_id: req.user.id}).then(profile => {
    Answer.findOne({_id: req.params.id}).then(answer => {
      if(!answer) res.json({noanswer: 'Answer not found'});
        //check if question is already downvoted
        if(answer.downvotes.filter(downvote => downvote.user.toString() === req.user.id).length > 0){
          //downvoted already:
          return res.json({alreadydownvoted: 'Answer already downvoted'});
        } else {
          //check if user upvoted the question
          if(answer.upvotes.filter(upvote => upvote.user.toString() === req.user.id).length > 0){
            //remove the upvote first
            // Get the remove index
            const removeIndex = answer.upvotes.map(item => item.user.toString()).indexOf(req.user.id);
            // Splice it out of the array
            answer.upvotes.splice(removeIndex, 1);
            // Add the user to the downvotes array
            answer.downvotes.unshift({user: req.user.id});
            // save the answer
            answer.save().then(answer => res.json(answer));
          } else {
            // Add the user to the downvotes array
            answer.downvotes.unshift({user: req.user.id});
            // save the answer
            answer.save().then(answer => res.json(answer));
          }
        }
    }).catch(err => res.json({noanswer: 'Answer does not exist'}))
  }).catch(err => res.json({nouser: 'User does not exist'}))
})

// @route   POST api/answer/comment/add
// @desc    Comment on an answer
// @access  private
router.post('/comment/add', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Validate user input first
  const {errors, isValid} = validateCommentInput(req.body);
  // Check Validation Errors
  if (!isValid) {
      return res.status(400).json(errors);
  }

  const commentFields = {};
  commentFields.user = req.user.id;
  commentFields.avatar = req.user.avatar;
  if(req.body.body) commentFields.body = req.body.body;
  if(req.body.answer_id) commentFields.question = req.body.answer_id;

  //check if user exists
  User.findOne({_id: req.user.id})
    .then(profile => {
      if(!profile) return res.json({noprofile: 'User not found'});
      Answer.findOne({_id: req.body.answer_id})
        .then(answer => {
          if(!answer) return res.json({noprofile: 'Answer not found'});
          //save the comment
          answer.comments.unshift(commentFields);
          // save the answer
          answer.save().then(answer => res.json(answer));
        }).catch(err => res.json({noanswer: 'Answer not found'}))
    }).catch(err => res.json({nouser: 'User not found'}))
})

// @route   POST api/answer/comment/delete
// @desc    Delete a comment on an answer
// @access  private
router.post('/comment/add', passport.authenticate('jwt', { session: false }), (req, res) => {
  
})


module.exports = router;
