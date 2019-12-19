const express = require('express');
const router = express.Router();
// const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const keys = require('../../config/keys');
const dotenv = require('dotenv');
dotenv.config();

// Load Input Validation
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

// Load User Model
const User = require('../../models/User');
const Profile = require('../../models/Profile');


// @route   GET api/auth/test
// @desc    Tests users route
// @access  public
router.get('/test', (req, res) => res.json({msg: 'users Works!'}));


// @route   POST api/auth/register
// @desc    Register User
// @access  public
router.post('/register', (req, res) => {
    // Validate the inputs
    const {errors, isValid} = validateRegisterInput(req.body);
    // Check Validation Errors

    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({email: req.body.email})
        .then(user => {
            if(user) {
                errors.email = 'Email already exists';
                return res.status(400).json({errors});
            } else {
                // const avatar = gravatar
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    avatar: 'test/for/now/png',
                    date: Date.now()
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                              // create a profile for the user
                              const profileFields = {};
                              profileFields.user = user.id;
                              // save the profile
                              // Save the profile
                              new Profile(profileFields).save().then(profile => {
                                res.json(user);
                              });
                            })
                            .catch(err => console.log(err));
                    });
                });
            }
        })
});

// @route   POST api/auth/login
// @desc    Login User / Return JWT Token
// @access  public
router.post('/login', (req, res) => {
    // Validate the inputs
    const {errors, isValid} = validateLoginInput(req.body);
    // Check Validation Errors
    if (!isValid) {
        return res.status(400).json({errors}); //.status(404)
    }

    const {email, password} = req.body;

    // Find user by email
    User.findOne({email})
        .then(user => {
            // check for user
            if (!user) {
                errors.email = 'Email not found';
                return res.status(404).json({errors});
            }

            //check Password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        // User Matched
                        // Create the payload
                        const payload = { id: user.id, name: user.name, avatar: user.avatar };
                        // Sign the Token
                        // expires in one week
                        jwt.sign(payload, keys.JWTKey, {expiresIn: 604800}, (err, token) => {
                            res.json({
                                reply: 'Success',
                                token: 'Bearer ' + token
                            })
                        });
                    } else {
                        errors.password = 'Password not correct';
                        return res.status(400).json({errors});
                    }
                })
                .catch(err => console.log(err));
        })
})

// @route   POST api/auth/send-reset
// @desc    Send User reset Password
// @access  public
router.post('/send-reset', (req, res) => {
  User.findOne({email: req.body.email})
    .then(user => {
      if(!user) res.status(404).json({nouser: 'Account not Found'});
      // generate a 4 digit pin
      let pin = Math.random().toString(36).substr(2, 4);
      user.resetPin.pin = pin;
      user.resetPin.expiresat = (new Date()).getTime();
      user.resetPin.stage = 2;
      // save to the db
      user.save().then(user => {
        // send the mail
        res.json({success: `An verification pin has been sent to ${req.body.email}, please check your email address`});
      })
    })
})

// @route   POST api/auth/confirm-reset
// @desc    Confirm Reset User Password
// @access  public
router.post('/confirm-reset', (req, res) => {
  const { email, pin } = req.body;
  User.findOne({email: email})
    .then(user => {
      if(!user) return res.status(404).json({nouser: 'Account not Found'});
      console.log(user.resetPin.pin);
      if(user.resetPin.pin !== pin) return res.status(400).json({pin: 'Incorrect Pin'})
      if(user.resetPin.stage !== 2) return res.status(400).json({pin: 'Unknown Error'})
      // compare the time and see if it's greater than 15minutes
      const then = user.resetPin.expiresat;
      const now = (new Date()).getTime();
      // function to get the difference in minutes
      function diff_minutes(dt2, dt1){
        var diff =(dt2 - dt1) / 1000;
        diff /= 60;
        return Math.abs(Math.round(diff));
      }

      let difference = diff_minutes(then, now);
      if(difference > 15) res.status(400).json({pin: 'Pin Already Expired'});
      user.resetPin.stage = 3;
      user.save().then(user => {
        res.json({confirmed: 'confirmed'});
      })
    })
})

// @route   POST api/auth/make-reset
// @desc    Reset User Password
// @access  public
router.post('/make-reset', (req, res) => {
  const { email, pin, newPassword } = req.body;
  User.findOne({email: email})
    .then(user => {
      if(!user) return res.status(404).json({pin: 'Account not Found'});
      if(user.resetPin.stage !== 3) res.status(400).json({pin: 'Unknown Error'})
      if(user.resetPin.pin !== pin) res.status(400).json({pin: 'Unknown Error'});
      // encrypt the password
      bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newPassword, salt, (err, hash) => {
              if(err) throw err;
              user.password = hash;
              user.resetPin.stage = 0;
              user.resetPin.pin = null;
              user.resetPin.expiresat = null;
              user.save()
                  .then(user => res.json(user))
                  .catch(err => console.log(err));
          });
      });
    })
})

// @route   POST api/auth/current
// @desc    Return Current User
// @access  private
router.get('/current', passport.authenticate('jwt', { session: false}), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar
    });
});

router.get('/facebook', passport.authenticate('facebook', {
  scope: [ 'email', 'public_profile', 'user_photos'],
  profileFields: ['id', 'displayName', 'photos'],
}));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: `${process.env.frontendURL}/login` }),
  function(req, res) {
    // Successful authentication, redirect home.
    // redirect to frontend
    res.redirect(`${process.env.frontendURL}/settoken/${req.user.token}`);
  });

router.get('/google',
  passport.authenticate('google', { scope:
      [ 'https://www.googleapis.com/auth/plus.login',
      , 'https://www.googleapis.com/auth/plus.profile.emails.read' ] }
));

router.get( '/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
}));


module.exports = router;
