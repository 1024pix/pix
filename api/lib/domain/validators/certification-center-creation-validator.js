const Joi = require('@hapi/joi');
const { EntityValidationError } = require('../errors');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const certificationCenterlidationJoiSchema = Joi.object({

  name: Joi.string()
    .max(255)
    .required()
    .messages({
      'string.empty': 'Le nom n’est pas renseigné.',
      'any.required': 'Le nom n’est pas renseigné.',
      'string.max': 'Le nom ne doit pas dépasser 255 caractères.',
    }),

  type: Joi.string()
    .required()
    .valid('SCO', 'SUP', 'PRO')
    .messages({
      'string.empty': 'Le type n’est pas renseigné.',
      'any.required': 'Le type n’est pas renseigné.',
      'any.only': 'Le type du centre de certification doit avoir l’une des valeurs suivantes: SCO, SUP, PRO.',
    }),

  externalId: Joi.string()
    .optional()
    .allow(null)
    .max(255)
    .messages({
      'string.max': 'L‘identifiant externe ne doit pas dépasser 255 caractères.',
    }),
});

module.exports = {

  validate(certificationCenter) {
    const { error } = certificationCenterlidationJoiSchema.validate(certificationCenter, validationConfiguration);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
    return true;
  },
};
