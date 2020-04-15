const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const PollSchema = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    title: {
        type: String,
        required: true
    },
    description: {
      type: String
    },
    options: [
      {
        title: {
          type: String
        }
      }
    ],
    image: {
      type: String
    },
    votes: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'users'
        },
        option: {
          type: String
        }
      }
    ],
    date: {
        type: Date,
        default: Date.now()
    }
})

const Poll = mongoose.model('polls', PollSchema);
module.exports = Poll;
