const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const NotificationSchema = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    triggeredBy: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    reaction: {
      type: String
    },
    title: {
      type: String
    },
    type: {
      type: String
    },
    link: {
      type: String
    },
    read: {
      type: Boolean,
      default: false
    },
    seen: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date,
      default: Date.now
    }
})

const Notification = mongoose.model('notifications', NotificationSchema);
module.exports = Notification;
