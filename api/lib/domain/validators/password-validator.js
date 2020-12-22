const Joi = require('@hapi/joi');
const XRegExp = require('xregexp');

const { passwordValidationPattern } = require('../../config').account;
const { EntityValidationError } = require('../errors');

const pattern = XRegExp(passwordValidationPattern);

const passwordValidationJoiSchema = Joi.object({
  password: Joi.string()
    .pattern(pattern)
    .required()
    .max(255)
    .messages({
      'string.empty': 'Votre mot de passe n’est pas renseigné.',
      'string.pattern.base': 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.',
      'string.max': 'Votre mot de passe ne doit pas dépasser les 255 caractères.',
      'any.required': 'Votre mot de passe n’est pas renseigné.',
    }),
});

module.exports = {
  validate(password) {
    const { error } = passwordValidationJoiSchema.validate({ password });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
    return true;
  },
};
