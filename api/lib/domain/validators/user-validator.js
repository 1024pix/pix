const _ = require('lodash');
const Joi = require('joi');
const validatePassword = require('../../infrastructure/validators/password-validator');
const { EntityValidationErrors } = require('../errors');

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

module.exports = {

  validate(user) {

    const joiValidationResults = Joi.validate(user, userValidationJoiSchema, validationConfiguration);
    if(joiValidationResults.error === null) {
      return Promise.resolve();
    } else {
      return Promise.reject(EntityValidationErrors.fromJoiErrors(joiValidationResults.error.details));
    }
  }

};
