const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Question Model
const Question = require('../../models/Question');
// Load Profile Model
const Profile = require('../../models/Profile');
// Load User Model
const User = require('../../models/User');
// Load Answer Model
const Answer = require('../../models/Answer');

// Load Category Model
const Category = require('../../models/Category');

// @route   GET api/category/test
// @desc    Tests answer route
// @access  public
router.get('/test', (req, res) => res.json({msg: 'category Works!'}));

// @route   GET api/category/all
// @desc    Gets all the categories
// @access  public
router.get('/all', (req, res) => {
  Category.find()
    .then(categories => {
      res.json(categories);
    });
})

// @route   GET api/category/add/:category
// @desc    Adds a category
// @access  public
router.get('/add/:category', passport.authenticate('jwt', { session: false }), (req, res) => {
  User.findById(req.user.id)
    .then(user => {
      console.log(user);
      if(!user || user.status !== 7) return res.status(400).json({error: 'unauthorized'});
      Category.findOne({title: req.params.category})
        .then(category => {
          if(category) return res.status(400).json({error: 'Category already exists'});
          if(!category){
            const categoryFields = {
              title: req.params.category
            };
            new Category(categoryFields)
            .save()
              .then(category => {
                res.json(category);
              })
          }
        })
    })
})

// @route   GET api/category/delete/:category
// @desc    Deletes a category
// @access  public
router.get('/delete/:category', passport.authenticate('jwt', { session: false }), (req, res) => {
  User.findById(req.user.id)
    .then(user => {
      console.log(user);
      if(!user || user.status !== 7) return res.status(400).json({error: 'unauthorized'});
      Category.findOne({title: req.params.category})
        .then(category => {
          if(!category) return res.status(400).json({error: 'Category does not exist'});
          if(category) {
            Category.deleteOne({title: req.params.category}).then(msg => res.json(msg))
          }

        })
    })
})

module.exports = router;
