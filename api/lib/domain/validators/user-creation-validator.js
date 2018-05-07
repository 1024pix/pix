const _ = require('lodash');
const googleReCaptcha = require('../../infrastructure/validators/grecaptcha-validator');
const userRepository = require('../../infrastructure/repositories/user-repository');
const userValidator = require('./user-validator');
const { UserCreationValidationErrors } = require('../../domain/errors');
const { InvalidRecaptchaTokenError } = require('../../infrastructure/validators/errors');
const { AlreadyRegisteredEmailError } = require('../../domain/errors');

function _verifyReCaptcha(reCaptchaToken) {
  return googleReCaptcha.verify(reCaptchaToken).catch(error => {
    if (error instanceof InvalidRecaptchaTokenError) {
      return _formatValidationError('recaptchaToken', 'Merci de cocher la case ci-dessous :');
    } else {
      throw error;
    }
  });
}

function _formatValidationError(key, message) {
  return {
    source: {
      pointer: `/data/attributes/${_.kebabCase(key)}`
    },
    title: `Invalid user data attribute "${key}"`,
    detail: message,
    meta: {
      field: key
    }
  };
}

function _concatErrors(recaptchaError, emailAvailabilityError, userValidationErrors) {
  const validationErrors = [];
  if (recaptchaError) {
    validationErrors.push(recaptchaError);
  }

  if (userValidationErrors instanceof Array) {
    validationErrors.push(...userValidationErrors);
  }

  if (emailAvailabilityError instanceof AlreadyRegisteredEmailError) {
    const joiEmailError = validationErrors.find((validationError) => validationError.meta.field === 'email');
    if (!joiEmailError) {
      validationErrors.push(_formatValidationError('email', 'L’adresse électronique est déjà utilisée.'));
    }
  }

  return validationErrors;
}

// FIXME move it in the "future" Use Case that creates a User
module.exports = {

  validate(user, recaptchaToken) {

    // TODO Formater les nouvelles erreurs de validation de user en JSONAPIError
    return Promise.all([
      _verifyReCaptcha(recaptchaToken),
      userRepository.isEmailAvailable(user.email).catch((error) => error),
      userValidator.validate(user).catch((errors) => errors),
    ])
      .then(values => {
        const recaptchaError = values[0];
        const emailAvailabilityError = values[1];
        const userValidationErrors = values[2];

        const validationErrors = _concatErrors(recaptchaError, emailAvailabilityError, userValidationErrors);

        if (validationErrors.length > 0) {
          return Promise.reject(new UserCreationValidationErrors(validationErrors));
        }

        return Promise.resolve();
      });
  }

};
