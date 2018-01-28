const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateProfileInput(data) {
    let errors = {};

    data.username = !isEmpty(data.username) ? data.username : '';
    data.date_of_birth = !isEmpty(data.date_of_birth) ? data.date_of_birth : '';
    data.gender = !isEmpty(data.gender) ? data.gender : '';
    data.telephone = !isEmpty(data.telephone) ? data.telephone : '';
    data.country = !isEmpty(data.country) ? data.country : '';
    data.image = !isEmpty(data.image) ? data.image : '';
    data.bio = !isEmpty(data.bio) ? data.bio : '';
    data.facebook = !isEmpty(data.facebook) ? data.facebook : '';
    data.twitter = !isEmpty(data.twitter) ? data.twitter : '';
    data.instagram = !isEmpty(data.instagram) ? data.instagram : '';
    data.linkedin = !isEmpty(data.linkedin) ? data.linkedin : '';

    if (Validator.isEmpty(data.username)){
        errors.username = 'Username Field is required';
    }

    if (!Validator.isLength(data.username, {min: 4, max: 30})){
        errors.username = 'Username must be between 4 and 30 characters';
    }

    if(!isEmpty(data.date_of_birth)){
      if(!Validator.toDate(data.date_of_birth)){
        errors.date_of_birth = 'Not a Valid Date';
      }
    }

    if(!isEmpty(data.gender)){
      if(!Validator.isLength(data.gender, {min: 4, max: 6})){
        errors.gender = 'Not a Valid Gender';
      }
    }

    if(!isEmpty(data.telephone)){
      if(!Validator.isMobilePhone(data.telephone)){
        errors.telephone = 'Not a Valid Telephone Number';
      }
    }

    if(!isEmpty(data.bio)){
      if(!Validator.isLength(data.bio, {min: 4, max: 100})){
        errors.bio = 'Bio must not be less than 4 and more than 100';
      }
    }

    if(!isEmpty(data.facebook)){
      if(!Validator.isURL(data.facebook)){
        errors.facebook = 'Not a valid URL';
      }
    }

    if(!isEmpty(data.twitter)){
      if(!Validator.isURL(data.twitter)){
        errors.twitter = 'Not a valid URL';
      }
    }

    if(!isEmpty(data.instagram)){
      if(!Validator.isURL(data.instagram)){
        errors.instagram = 'Not a valid URL';
      }
    }

    if(!isEmpty(data.linkedin)){
      if(!Validator.isURL(data.linkedin)){
        errors.linkedin = 'Not a valid URL';
      }
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}
