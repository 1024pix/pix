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
    .messages({
      'string.empty': 'Votre adresse e-mail n’est pas renseignée.',
      'string.email': 'Votre adresse e-mail n’est pas correcte.',
    }),

  username: Joi.string()
    .messages({
      'string.empty': 'Votre identifiant n’est pas renseigné.',
    }),

  password: Joi.string()
    .pattern(pattern)
    .required()
    .messages({
      'string.empty': 'Votre mot de passe n’est pas renseigné.',
      'string.pattern.base': 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.',
    }),

  cgu: Joi.boolean()
    .when('$cguRequired', {
      is: Joi.boolean().required().valid(true),
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .valid(true)
    .messages({
      'boolean.base': 'Vous devez accepter les conditions d’utilisation de Pix pour créer un compte.',
      'any.only': 'Vous devez accepter les conditions d’utilisation de Pix pour créer un compte.',
    }),
}).xor('username', 'email')
  .required()
  .messages({
    'any.required': 'Aucun champ n\'est renseigné.',
    'object.missing': 'Vous devez renseigner une adresse e-mail et/ou un identifiant.',
  });

module.exports = {

  validate({ user, cguRequired = true }) {
    const { error } = userValidationJoiSchema.validate(user, { ...validationConfiguration, context: { cguRequired } });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
    return true;
  }
};
