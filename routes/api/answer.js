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

// @route   GET api/answer/test
// @desc    Tests answer route
// @access  public
router.get('/test', (req, res) => res.json({msg: 'answer Works!'}));

// @route   POST api/answer/create
// @desc    Create or Edit an answer
// @access  private
router.post('/create', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Validate the inputs
  const errors = {};
  //const {errors, isValid} = validateAnswerInput(req.body);
  // Check Validation Errors
  // if (!isValid) {
  //     return res.status(400).json(errors);
  // }

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
        notifyFor.user = question.user;
        // Check if question was created by the user
        // Save the question
        new Answer(answerFields).save()
          .then(answer => {
            //Add answer to the questions array
            question.answers.unshift({answer: answer._id});
            question.save().then(question => {
              Question.findOne({slug: question.slug})
                .populate({
                  path: 'user answers.answer answers.answer',
                  populate: {
                    path: 'user comments.user'
                  }
                }).then(question => {
                  notify(req.user.id, req.user.name, 'Answered', 'Question', question.slug, notifyFor.user);
                  res.json(question);
                })
            })
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

// @route   GET api/answer/delete/:id
// @desc    Delete an answer
// @access  private
router.delete('/delete/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  // first check if user profile exists
  Profile.findOne({user: req.user.id}).then(profile => {
    // wtf i need to check if the question was posted by the user
    Answer.findOne({_id: req.params.id})
      .then(answer => {
        // Check if question was posted by user
        if ( answer.user._id.toString() === req.user.id.toString() ) {
          Answer.deleteOne({_id: req.params.id}).then(msg => {
            Question.findOne({_id: answer.question.toString()})
              .then(question => {
                  // Get the remove index
                  const removeIndex = question.answers.map(item => item.answer.toString()).indexOf(req.params.id);
                  // Splice it out of the array
                  question.answers.splice(removeIndex, 1);
                  if(question.best_answer && question.best_answer.toString() === req.params.id) question.best_answer = null;
                  // Save the post
                  question.save().then(question => res.json(msg));
                  // finally
              })

          });
        } else {
          return res.status(400).json({unauthorized: 'Unauthorized'});
        }
      })
  })
})

// @route   GET api/answer/for/:id
// @desc    Get answers for a uestion
// @access  public
router.get('/for/:id', (req, res) => {
  const errors = {};
  const {id} = req.params;
  Question.findById(id)
    .then(question => {
      if(!question) res.status(404).json({noquestion: 'Question not found'});
      if(question){
        Answer.find({question: id})
          .populate('user', ['name', 'avatar'])
          .then(answer => {
            if(answer.length < 1) res.status(404).json({noanswers: 'No answers for this question'});
            if(answer.length >= 1 ) res.json(answer);
          })
      }
    })
})

// @route   GET api/answer/upvote/:id
// @desc    Upvote an answer
// @access  private
router.get('/upvote/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const errors = {};

  //check if user profile exists
  Profile.findOne({user: req.user.id}).then(profile => {
    Answer.findOne({_id: req.params.id}).then(answer => {
      if(!answer) res.json({noanswer: 'Answer not found'});
        //check if question is already upvoted
        notifyFor.user = answer.user;
        if(answer.upvotes.filter(upvote => upvote.user.toString() === req.user.id).length > 0){
          //upvoted already:
          return res.status(400).json({alreadyupvoted: 'Answer already upvoted'});
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
            answer.save().then(answer => {
              Question.findById(answer.question)
                .populate({
                  path: 'user answers.answer answers.answer',
                  populate: {
                    path: 'user comments.user'
                  }
                }).then(question => {
                  notify(req.user.id, req.user.name, 'Upvoted', 'Answer', question.slug, notifyFor.user);
                  res.json(question);
                })
            })
          } else {
            // Add the user to the upvotes array
            answer.upvotes.unshift({user: req.user.id});
            // save the downvotes
            answer.save().then(answer => {
              Question.findById(answer.question)
                .populate({
                  path: 'user answers.answer answers.answer',
                  populate: {
                    path: 'user comments.user'
                  }
                }).then(question => {
                  notify(req.user.id, req.user.name, 'Upvoted', 'Answer', question.slug, notifyFor.user);
                  res.json(question);
                })
            })
          }
        }
    }).catch(err => res.status(404).json({noanswer: 'Answer does not exist'}))
  }).catch(err => res.status(404).json({nouser: 'User does not exist'}))
})


// @route   GET api/answer/downvote/:id
// @desc    Downvote an answer
// @access  private
router.get('/downvote/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const errors = {};
  //check if user profile exists
  Profile.findOne({user: req.user.id}).then(profile => {
    Answer.findOne({_id: req.params.id}).then(answer => {
      if(!answer) res.json({noanswer: 'Answer not found'});
        notifyFor.user = answer.user;
        //check if question is already downvoted
        if(answer.downvotes.filter(downvote => downvote.user.toString() === req.user.id).length > 0){
          //downvoted already:
          return res.status(400).json({alreadydownvoted: 'Answer already downvoted'});
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
            answer.save().then(answer => {
              Question.findById(answer.question)
                .populate({
                  path: 'user answers.answer answers.answer',
                  populate: {
                    path: 'user comments.user'
                  }
                }).then(question => {
                  notify(req.user.id, req.user.name, 'Downvoted', 'Answer', question.slug, notifyFor.user);
                  res.json(question);
                })
            })
          } else {
            // Add the user to the downvotes array
            answer.downvotes.unshift({user: req.user.id});
            // save the answer
            answer.save().then(answer => {
              Question.findById(answer.question)
                .populate({
                  path: 'user answers.answer',
                  populate: {
                    path: 'user'
                  }
                }).then(question => {
                  notify(req.user.id, req.user.name, 'Downvoted', 'Answer', question.slug, notifyFor.user);
                  res.json(question);
                })
            });
          }
        }
    }).catch(err => res.status(404).json({noanswer: 'Answer does not exist'}))
  }).catch(err => res.status(404).json({nouser: 'User does not exist'}))
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
  Profile.findOne({user: req.user.id})
    .then(profile => {
      if(!profile) return res.json({noprofile: 'User not found'});
      Answer.findOne({_id: req.body.answer_id})
        .populate({
          path: 'comments.user'
        })
        .then(answer => {
          if(!answer) return res.json({noanswer: 'Answer not found'});
          notifyFor.user = answer.user;
          //save the comment
          answer.comments.push(commentFields);
          // save the answer
          answer.save().then(answer => {
            Question.findById(answer.question)
              .populate({
                path: 'user answers.answer answers.answer',
                populate: {
                  path: 'user comments.user'
                }
              }).then(question => {
                notify(req.user.id, req.user.name, 'Commented', 'Answer', question.slug, notifyFor.user);
                res.json(question);
              })
          });
        }).catch(err => res.json({noanswer: 'Answer not found'}))
    }).catch(err => res.json({nouser: 'User not found'}))
})

// @route   POST api/answer/comment/delete
// @desc    Delete a comment on an answer
// @access  private
router.post('/comment/delete', passport.authenticate('jwt', { session: false }), (req, res) => {
  //answer_id and comment_id
  //check if user exists
  Profile.findOne({user: req.user.id})
    .then(profile => {
      if(!profile) return res.json({noprofile: 'User not found'});
      Answer.findOne({_id: req.body.answer_id})
        .populate({
          path: 'comments.user'
        })
        .then(answer => {
          if(!answer) return res.json({noanswer: 'Answer not found'});
          //check if comment exists
          if(!answer.comments.filter(comment => comment._id.toString() === req.body.comment_id).length > 0) res.json({nocomment: 'Comment does not exist'})
          // Get the remove index
          const removeIndex = answer.comments.map(comment => comment._id.toString()).indexOf(req.body.comment_id);
          // Splice it out of the array
          answer.comments.splice(removeIndex, 1);
          // save the answer
          answer.save().then(answer => {
            Question.findById(answer.question)
              .populate({
                path: 'user answers.answer answers.answer',
                populate: {
                  path: 'user comments.user'
                }
              }).then(question => {
                //notify(req.user.id, req.user.name, 'Upvoted', 'Answer', question.slug, notifyFor.user);
                res.json(question);
              })
          })
        }).catch(err => res.json({noanswer: 'Answer not found'}))
    }).catch(err => res.json({nouser: 'User not found'}))
})

// @route   POST api/answer/report/:id
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
    Answer.findById(req.params.id).then(question => {
      if(!question) {
        errors.noquestion = 'Answer not found';
        return res.status(404).json(errors);
      }

      // set the report fileds
      const reportFields = {};
      reportFields.type = 'answer';
      reportFields.id = req.params.id;
      reportFields.question = question.question;
      reportFields.user = req.user.id;

      // Save the report
      new Reported(reportFields).save().then(reported => res.json(reported));

    }).catch(err => res.json(err))
  })
})



module.exports = router;
