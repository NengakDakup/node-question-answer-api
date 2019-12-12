const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const AnswerSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    body: {
        type: Object,
        required: true
    },
    upvotes: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'users'
        }
      }
    ],
    downvotes: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'users'
        }
      }
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'users'
        },
        body: {
          type: String,
          required: true
        },
        avatar: {
          type: String,
          required: true
        },
        date: {
          type: Date,
          default: Date.now
        }

      }
    ],
    status: {
      type: Boolean,
      default: true
    },
    date: {
      type: Date,
      default: Date.now
    }
})

const Answer = mongoose.model('answers', AnswerSchema);
module.exports = Answer;
