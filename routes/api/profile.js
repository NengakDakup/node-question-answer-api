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

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  public
router.get('/test', (req, res) => res.json({msg: 'profile Works!'}));

// @route   GET api/profile
// @desc    Get the current users profile
// @access  private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.user.id})
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if(!profile){
        errors.noprofile = 'There is no profile for this user';
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(400).json(err));
})

// @route   GET api/profile/all
// @desc    Get All the user profiles
// @access  public
router.get('/all', (req, res) => {
  const errors = {};
  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      if(!profiles) {
        errors.noprofiles = 'There are no profiles';
        return res.status(404).json(errors);
      }

      res.json(profiles);
    })
    .catch(err => res.status(404).json({profile: 'There are no profiles'}));
})

// @route   GET api/profile/handle/:username
// @desc    Get Profile by handle
// @access  public
// router.get('/handle/:username', (req, res) => {
//   const errors = {};
//   Profile.findOne({username: req.params.username})
//     .populate('user', ['name', 'avatar'])
//     .then(profile => {
//       if(!profile) {
//         errors.noprofile = 'There is no profile for this user';
//         return res.status(400).json(errors);
//       }
//       res.json(profile);
//     })
//     .catch(err => {
//       errors.noprofile = 'There is no Profile for this user';
//       res.status(400).json(errors);
//     });
// })

// @route   GET api/profile/user/:id
// @desc    Get Profile by id
// @access  public
router.get('/user/:id', (req, res) => {
  const errors = {};
  const {id} = req.params;
  Profile.findOne({user: id})
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if(!profile){
        errors.noprofile = 'User not Found';
        return res.status(404).json(errors);
      }
      if(profile) return res.json(profile);
    })
    .catch(err => {
      errors.noprofile = 'User not Found';
      res.status(400).json(errors);
    });
})

// @route   POST api/profile/create
// @desc    Craete or Edit user profile
// @access  private
router.post('/create', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Validate the inputs
  const {errors, isValid} = validateProfileInput(req.body);
  // Check Validation Errors
  if (!isValid) {
      return res.status(400).json(errors);
  }

  // Get all the fields entered
  const profileFields = {};
  profileFields.user = req.user.id;
  if(req.body.username) profileFields.username = req.body.username;
  if(req.body.date_of_birth) profileFields.date_of_birth = req.body.date_of_birth;
  if(req.body.gender) profileFields.gender = req.body.gender;
  if(req.body.telephone) profileFields.telephone = req.body.telephone;
  if(req.body.country) profileFields.country = req.body.country;
  if(req.body.image) profileFields.image = req.body.image;
  if(req.body.bio) profileFields.bio = req.body.bio;
  // Socials
  profileFields.social = {};
  if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if(req.body.instagram) profileFields.social.instagram = req.body.instagram;
  if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;

  Profile.findOne({user: req.user.id}).then(profile => {
    if (profile){
      //Update
      Profile.findOneAndUpdate(
        { user: req.user.id},
        { $set: profileFields },
        { new: true}
      )
      .then(profile => res.json(profile))
    } else {
      // Create
      // Check if username is already taken
      Profile.findOne({ username: profileFields.username}).then(profile => {
        if(profile) {
          errors.handle = 'Username already exists';
          return res.status(400).json(errors);
        }

        // Save the profile
        new Profile(profileFields).save().then(profile => res.json(profile));
      })
    }

  })


})

module.exports = router;
