const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const ReportedSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    question: {
      type: String
    },
    id: {
        type: String,
        required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    date: {
        type: Date,
        default: Date.now
    }

})

const Reported = mongoose.model('reported', ReportedSchema);
module.exports = Reported;
