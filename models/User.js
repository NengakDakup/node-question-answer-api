const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    resetPin: {
      pin: {
          type: String,
          default: null
      },
      expiresat: {
        type: Date,
        default: null
      },
      stage: {
        type: Number,
        default: 1
      },
    },
    avatar: {
        type: String
    },
    status: {
        type: Number,
        default: 1
    },
    facebookId: {
      type: String
    },
    googleId: {
      type: String
    },
    date: {
        type: Date,
        default: Date.now()
    }

})

const User = mongoose.model('users', UserSchema);
module.exports = User;
