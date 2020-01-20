const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const CategorySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
      type: String
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

const Category = mongoose.model('categories', CategorySchema);
module.exports = Category;
