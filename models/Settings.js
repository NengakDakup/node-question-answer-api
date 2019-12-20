const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const SettingsSchema = new Schema({
    categories: [
      {
        name: {
          type: String
        }
      }
    ],
    best_user: {
      type: Schema.Types.ObjectId,
      ref: 'profiles'
    },
    best_answer: {
      type: Schema.Types.ObjectId,
      ref: 'questions'
    },
    contact: {
      email: {
        type: String
      },
      socials: {
        facebook: {
          type: String
        },
        twitter: {
          type: String
        },
        instagram: {
          type: String
        },
        whatsapp: {
          type: String
        }
      }
    }

})

const Settings = mongoose.model('settings', SettingsSchema);
module.exports = Settings;
