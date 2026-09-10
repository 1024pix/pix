import Joi from 'joi';

import { EntityValidationError } from '../../../shared/domain/errors.js';

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const organizationValidationJoiSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Le nom n’est pas renseigné.',
  }),

  type: Joi.string().required().valid('SCO', 'SUP', 'PRO', 'SCO-1D').messages({
    'string.empty': 'Le type n’est pas renseigné.',
    'any.only': 'Le type de l’organisation doit avoir l’une des valeurs suivantes: SCO, SUP, PRO.',
  }),

  documentationUrl: Joi.string().uri().allow(null).messages({
    'string.uri': 'Le lien vers la documentation n’est pas valide.',
  }),

  administrationTeamId: Joi.number().required().messages({
    'any.required': 'L’équipe en charge n’est pas renseignée.',
  }),

  countryCode: Joi.number().min(99000).max(99999).integer().required().messages({
    'any.required': 'Le code pays n’est pas renseigné.',
    'number.min': 'Le code pays doit être un nombre entier compris entre 99000 et 99999.',
    'number.max': 'Le code pays doit être un nombre entier compris entre 99000 et 99999.',
  }),

  organizationLearnerType: Joi.object({
    id: Joi.number().required(),
    name: Joi.string().allow(null),
  })
    .required()
    .messages({
      'any.required': "Le public prescrit n'est pas renseigné.",
    }),

  categoryId: Joi.number().empty(null, '').required().messages({
    'any.required': "La catégorie n'est pas renseignée.",
    'number.base': "L'ID de catégorie doit être un nombre entier.",
  }),
});

const validate = function (organizationCreationParams) {
  const { error } = organizationValidationJoiSchema.validate(organizationCreationParams, validationConfiguration);
  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }
  return true;
};

export { validate };
