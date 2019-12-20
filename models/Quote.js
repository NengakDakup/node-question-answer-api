const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const QuoteSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
      type: String,
      required: true
    },
    date: {
        type: Date,
        default: Date.now
    }

})

const Quote = mongoose.model('quotes', QuoteSchema);
module.exports = Quote;
