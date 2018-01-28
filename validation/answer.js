const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateAnswerInput(data) {
    let errors = {};

    data.body = !isEmpty(data.body) ? data.body : '';
    data.question_id = !isEmpty(data.question_id) ? data.question_id : '';

    if(Validator.isEmpty(data.body)) {
        errors.body = 'Answer field is required';
    }

    if(Validator.isEmpty(data.question_id)) {
        errors.question_id = 'Question id is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}
