const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const SuscribeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    date: {
      type: Date,
      default: Date.now
    }

})

const Suscribe = mongoose.model('suscribers', SuscribeSchema);
module.exports = Suscribe;
