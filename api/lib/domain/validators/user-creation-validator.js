const googleReCaptcha = require('../../infrastructure/validators/grecaptcha-validator');
const userValidator = require('./user-validator');
const { UserCreationValidationErrors } = require('../../domain/errors');
const { InvalidRecaptchaTokenError } = require('../../infrastructure/validators/errors');

function _verifyReCaptcha(reCaptchaToken) {
  return googleReCaptcha.verify(reCaptchaToken).catch(error => {
    if (error instanceof InvalidRecaptchaTokenError) {
      return {
        source: {
          pointer: '/data/attributes/recaptcha-token'
        },
        title: 'Invalid reCAPTCHA token',
        detail: 'Merci de cocher la case ci-dessous :',
        meta: {
          field: 'recaptchaToken'
        }
      };
    } else {
      throw error;
    }
  });
}

function _concatErrors(recaptchaError, userDataErrors) {
  const validationErrors = [];
  if (recaptchaError) {
    validationErrors.push(recaptchaError);
  }
  if (userDataErrors instanceof Array) {
    validationErrors.push(...userDataErrors);
  }
  return validationErrors;
}

// FIXME move it in the "future" Use Case that creates a User
module.exports = {

  validate(userData, recaptchaToken) {
    return Promise.all([
      _verifyReCaptcha(recaptchaToken),
      userValidator.validate(userData).catch((errors) => errors),
    ])
      .then(values => {
        const recaptchaError = values[0];
        const userDataErrors = values[1];

        const validationErrors = _concatErrors(recaptchaError, userDataErrors);

        if (validationErrors.length > 0) {
          return Promise.reject(new UserCreationValidationErrors(validationErrors));
        }

        return Promise.resolve();
      });
  }

};
