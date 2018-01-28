const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const QuestionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    question_title: {
        type: String,
        required: true
    },
    category_id: {
        type: String,
    },
    body: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    likes: [
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
        text: {
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
    best_answer: {
      type: Schema.Types.ObjectId,
      ref: 'answers'
    },
    status: {
      type: Boolean,
      default: true
    },
    tags: {
      type: String
    },
    image: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now
    }

})

const Question = mongoose.model('questions', QuestionSchema);
module.exports = Question;
