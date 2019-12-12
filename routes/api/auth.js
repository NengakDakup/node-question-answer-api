const express = require('express');
const router = express.Router();
// const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const keys = require('../../config/keys');

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

module.exports = router;
