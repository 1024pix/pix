const _ = require('lodash');
const Joi = require('joi');
const validatePassword = require('../../infrastructure/validators/password-validator');
const userRepository = require('../../infrastructure/repositories/user-repository');
const { AlreadyRegisteredEmailError } = require('../../domain/errors');

const JOI_VALIDATION_ERROR = 'ValidationError';
const validationConfiguration = { abortEarly: false, allowUnknown: true };

const joiWithPasswordValidation = Joi.extend((joi) => ({
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
    }
  ]
}));

const userValidationJoiSchema = Joi.object().keys({

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

  password: joiWithPasswordValidation.string().password().required().min(8).error((errors) => {
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

module.exports = {

  validate(userData) {
    return Promise.all([
      Joi.validate(userData, userValidationJoiSchema, validationConfiguration).catch((errors) => errors),
      userRepository.isEmailAvailable(userData.email).catch((error) => error),
    ])
      .then((values) => {
        const joiErrors = values[0];
        const emailAvailabilityError = values[1];
        const validationErrors = [];

        if (joiErrors.name === JOI_VALIDATION_ERROR) {
          validationErrors.push(...joiErrors.details.map((joiError) => _formatValidationError(joiError.context.key, joiError.message)));
        }

        if (emailAvailabilityError instanceof AlreadyRegisteredEmailError) {
          const joiEmailError = validationErrors.find((validationError) => validationError.meta.field === 'email');
          if (!joiEmailError) {
            validationErrors.push(_formatValidationError('email', 'L’adresse électronique est déjà utilisée.'));
          }
        }

        if (validationErrors.length > 0) {
          return Promise.reject(validationErrors);
        }

        return Promise.resolve();
      });
  }

};
