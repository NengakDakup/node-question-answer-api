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
        type: String
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
    answers: [
      {
        answer: {
          type: Schema.Types.ObjectId,
          ref: 'answers'
        }
      }
    ],
    best_answer: {
      type: Schema.Types.ObjectId,
      ref: 'answers'
    },
    status: {
      type: Number,
      default: 1
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
