const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateCommentInput(data) {
    let errors = {};

    data.body = !isEmpty(data.body) ? data.body : '';
    data.answer_id = !isEmpty(data.answer_id) ? data.answer_id : '';

    if(Validator.isEmpty(data.body)) {
        errors.body = 'Comment field is required';
    }

    if(Validator.isEmpty(data.answer_id)) {
        errors.answer_id = 'Answer id is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}
