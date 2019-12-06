const Joi = require('@hapi/joi');
const XRegExp = require('xregexp');
const { passwordValidationPattern } = require('../../config').account;
const { EntityValidationError } = require('../errors');

const pattern = XRegExp(passwordValidationPattern);
const validationConfiguration = { abortEarly: false, allowUnknown: true };

const userValidationJoiSchema = Joi.object({

  firstName: Joi.string()
    .required()
    .messages({
      'string.empty': 'Votre prénom n’est pas renseigné.',
    }),

  lastName: Joi.string()
    .required()
    .messages({
      'string.empty': 'Votre nom n’est pas renseigné.',
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Votre adresse e-mail n’est pas renseignée.',
      'string.email': 'Votre adresse e-mail n’est pas correcte.',
    }),

  password: Joi.string()
    .pattern(pattern)
    .required()
    .messages({
      'string.empty': 'Votre mot de passe n’est pas renseigné.',
      'string.pattern.base': 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.',
    }),

  cgu: Joi.boolean()
    .required()
    .valid(true)
    .messages({
      'boolean.base': 'Vous devez accepter les conditions d’utilisation de Pix pour créer un compte.',
      'any.only': 'Vous devez accepter les conditions d’utilisation de Pix pour créer un compte.',
    }),
});

module.exports = {

  validate(user) {

    const { error } = userValidationJoiSchema.validate(user, validationConfiguration);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    } else {
      return Promise.resolve();
    }
  }

};
