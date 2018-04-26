const _ = require('lodash');
const Joi = require('joi');
const googleReCaptcha = require('../../infrastructure/validators/grecaptcha-validator');
const { UserValidationErrors } = require('../../domain/errors');
const { InvalidRecaptchaTokenError } = require('../../infrastructure/validators/errors');
const validatePassword = require('../../infrastructure/validators/password-validator');

const JOI_VALIDATION_ERROR = 'ValidationError';

const customJoi = Joi.extend((joi) => ({
  name: 'string',
  base: joi.string(),
  rules: [
    {
      name: 'password',
      validate(params, value, state, options) {
        const isValid = validatePassword(value);
        if (!isValid) {
          return this.createError('string.password', { v: value }, state, options);
        }
        return value;
      }
    },
  ]
}));

const schemaValidateUser = customJoi.object().keys({

  firstName: Joi.string().required().error(() => {
    return { message: 'Votre prénom n’est pas renseigné.' };
  }),

  lastName: Joi.string().required().error(() => {
    return { message: 'Votre nom n’est pas renseigné.' };
  }),

  email: Joi.string().email().required().error((errors) => {
    const error = errors[0];
    if (error.type === 'any.empty') {
      return { message: 'Votre adresse électronique n’est pas renseignée.' };
    }
    return { message: 'Votre adresse électronique n’est pas correcte.' };
  }),

  password: customJoi.string().password().required().min(8).error((errors) => {
    const error = errors[0];
    if (error.type === 'any.empty') {
      return { message: 'Votre mot de passe n’est pas renseigné.' };
    }
    return { message: 'Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.' };
  }),

  cgu: Joi.boolean().required().valid(true).error(() => {
    return { message: 'Vous devez accepter les conditions d’utilisation de Pix pour créer un compte.' };
  }),
});

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

function _validateUserData(userData) {
  const validationConfiguration = { abortEarly: false, allowUnknown: true };
  return Joi.validate(userData, schemaValidateUser, validationConfiguration).catch(error => {
    if (error.name === JOI_VALIDATION_ERROR) {
      const userDataErrors = error.details.map(joiError => {
        return {
          source: {
            pointer: `/data/attributes/${_.kebabCase(joiError.context.key)}`
          },
          title: `Invalid user data attribute "${joiError.context.key}"`,
          detail: joiError.message,
          meta: {
            field: joiError.context.key
          }
        };
      });
      return userDataErrors;
    }
    throw error;
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

  validate(userData, recaptchaToken, recaptchaTokenRequired) {
    return Promise.all([
      _verifyReCaptcha(recaptchaToken),
      _validateUserData(userData),
    ])
      .then(values => {
        const recaptchaError = values[0];
        const userDataErrors = values[1];

        const validationErrors = _concatErrors(recaptchaError, userDataErrors);

        if (validationErrors.length > 0) {
          return Promise.reject(new UserValidationErrors(validationErrors));
        }

        return Promise.resolve();
      });
  }

};
