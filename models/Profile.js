const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const ProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    username: {
        type: String,
        max: 40
    },
    date_of_birth: {
        type: Date,
    },
    gender: {
        type: String,
    },
    telephone: {
        type: Number,
    },
    country: {
        type: String
    },
    points: {
      type: Number,
      default: 0
    },
    followers: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'users'
        }
      }
    ],
    social: {
      facebook: {
        type: String
      },
      twitter: {
        type: String
      },
      instagram: {
        type: String
      },
      linkedin: {
        type: String
      },
    },
    image: {
      type: String
    },
    bio: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now
    }

})

const Profile = mongoose.model('profiles', ProfileSchema);
module.exports = Profile;
