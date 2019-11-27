const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateQuestionInput(data) {
    let errors = {};

    data.question_title = !isEmpty(data.question_title) ? data.question_title : '';
    data.category_id = !isEmpty(data.category_id) ? data.category_id : '';
    data.body = !isEmpty(data.body) ? data.body : '';
    data.tags = !isEmpty(data.tags) ? data.tags : '';
    data.image = !isEmpty(data.image) ? data.image : '';

    if (Validator.isEmpty(data.question_title)){
        errors.title = 'Question Title is required';
    }

    if(!isEmpty(data.body)){
      if (!Validator.isLength(data.body, {min: 20, max: 300000})){
          errors.body = 'Body must not be less than 20 characters';
      }
    }

    if(!isEmpty(data.category_id)){
      if (!Validator.isLength(data.category_id, {min: 2, max: 30})){
          errors.category_id = 'Category must be between 2 and 30 characters';
      }
    }

    if(!isEmpty(data.tags)){
      if(!Validator.isLength(data.tags, {min: 4, max: 30})){
        errors.tags = 'Tags must be between 4 and 30';
      }
    }


    return {
        errors,
        isValid: isEmpty(errors)
    }
}
