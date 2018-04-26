const _ = require('lodash');
const Joi = require('joi');
const googleReCaptcha = require('../../infrastructure/validators/grecaptcha-validator');
const { UserValidationErrors } = require('../../domain/errors');
const { InvalidRecaptchaTokenError } = require('../../infrastructure/validators/errors');

const JOI_VALIDATION_ERROR = 'ValidationError';

const schemaValidateUser = Joi.object().keys({
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
  password: Joi.string().required().min(8).error((errors) => {
    const error = errors[0];
    if (error.type === 'any.empty') {
      return { message: 'Votre mot de passe n’est pas renseigné.' };
    }
    return { message: 'Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.' };
  }),
  cgu: Joi.boolean().required().valid(true).truthy('true').error(() => {
    return { message: 'Vous devez accepter les conditions d’utilisation de Pix pour créer un compte.' };
  }),
});

// FIXME move it in the "future" Use Case that creates a User
module.exports = {

  validate(userData, recaptchaToken) {
    const validateRecaptcha = googleReCaptcha.verify(recaptchaToken);
    const validateUserData = Joi.validate(userData, schemaValidateUser, { abortEarly: false });

    return Promise.all([

      // validate reCAPTCHA token
      validateRecaptcha.catch(error => {
        if (error instanceof InvalidRecaptchaTokenError) {
          return {
            source: '/data/attributes/recaptcha-token',
            title: 'Invalid reCAPTCHA token',
            details: 'Merci de cocher la case ci-dessous :',
            meta: {
              field: 'recaptchaToken'
            }
          };
        } else {
          throw error;
        }
      }),

      // validate user data
      validateUserData.catch(error => {
        if (error.name === JOI_VALIDATION_ERROR) {
          const userDataErrors = error.details.map(joiError => {
            return {
              source: `/data/attributes/${_.kebabCase(joiError.context.key)}`,
              title: `Invalid user data attribute "${joiError.context.key}"`,
              details: joiError.message,
              meta: {
                field: joiError.context.key
              }
            };
          });
          return userDataErrors;
        }
        throw error;
      }),
    ]).then(values => {
      const recaptchaError = values[0];
      const userDataErrors = values[1];

      if (!recaptchaError && !(userDataErrors instanceof Array)) {
        return Promise.resolve();
      }

      let validationErrors = [];

      if (recaptchaError) {
        validationErrors.push(recaptchaError);
      }
      if (userDataErrors) {
        validationErrors.push(...userDataErrors);
      }
      return Promise.reject(new UserValidationErrors(validationErrors));
    }).catch(error => {
      throw error;
    });
  }

};
