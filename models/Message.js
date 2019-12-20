const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const MessageSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    email: {
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

const Message = mongoose.model('messages', MessageSchema);
module.exports = Message;
