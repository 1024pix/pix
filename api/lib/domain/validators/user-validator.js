const Joi = require('@hapi/joi');
const XRegExp = require('xregexp');
const { passwordValidationPattern } = require('../../config').account;
const { EntityValidationError } = require('../errors');

const pattern = XRegExp(passwordValidationPattern);
const validationConfiguration = { abortEarly: false, allowUnknown: true };

const userValidationJoiSchema = Joi.object({

  firstName: Joi.string()
    .required()
    .max(255)
    .messages({
      'string.empty': 'Votre prénom n’est pas renseigné.',
      'string.max': 'Votre prénom ne doit pas dépasser les 255 caractères.',
    }),

  lastName: Joi.string()
    .required()
    .max(255)
    .messages({
      'string.empty': 'Votre nom n’est pas renseigné.',
      'string.max': 'Votre nom ne doit pas dépasser les 255 caractères.',
    }),

  email: Joi.string()
    .max(255)
    .email({ ignoreLength: true })
    .messages({
      'string.empty': 'Votre adresse e-mail n’est pas renseignée.',
      'string.max': 'Votre adresse e-mail ne doit pas dépasser les 255 caractères.',
      'string.email': 'Le format de l\'adresse e-mail est incorrect.',
    }),

  username: Joi.string()
    .messages({
      'string.empty': 'Votre identifiant n’est pas renseigné.',
    }),

  password: Joi.string()
    .pattern(pattern)
    .required()
    .max(255)
    .messages({
      'string.empty': 'Votre mot de passe n’est pas renseigné.',
      'string.pattern.base': 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.',
      'string.max': 'Votre mot de passe ne doit pas dépasser les 255 caractères.',
    }),

  cgu: Joi.boolean()
    .when('$cguRequired', {
      is: Joi.boolean().required().valid(true),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .valid(true)
    .messages({
      'boolean.base': 'Vous devez accepter les conditions d’utilisation de Pix pour créer un compte.',
      'any.only': 'Vous devez accepter les conditions d’utilisation de Pix pour créer un compte.',
    }),

  mustValidateTermsOfService: Joi.boolean(),

  hasSeenAssessmentInstructions: Joi.boolean(),

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
  },
};
