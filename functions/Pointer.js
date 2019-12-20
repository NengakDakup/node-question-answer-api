const express = require('express');
const mongoose = require('mongoose');

// Load Question Model
const Profile = require('../models/Profile');

module.exports = function(user, reaction){
  switch (reaction) {
    case 'Liked':
      Profile.findOne({user: user})
        .then(profile => {
          profile.points += 1;
          profile.save()
            .then(profile => true)
        })
      break;
    case 'Disliked':
      Profile.findOne({user: user})
        .then(profile => {
          profile.points -= 1;
          profile.save()
            .then(profile => true)
        })
      break;
    case 'Upvoted':
      Profile.findOne({user: user})
        .then(profile => {
          profile.points += 3;
          profile.save()
            .then(profile => true)
        })
      break;
    case 'Downvoted':
      Profile.findOne({user: user})
        .then(profile => {
          profile.points -= 3;
          profile.save()
            .then(profile => true)
        })
      break;
    case 'Approved':
      Profile.findOne({user: user})
        .then(profile => {
          profile.points += 7;
          profile.save()
            .then(profile => true)
        })
      break;
      case 'Disapproved':
        Profile.findOne({user: user})
          .then(profile => {
            profile.points -= 7;
            profile.save()
              .then(profile => true)
          })
        break;
    default:

  }
}
