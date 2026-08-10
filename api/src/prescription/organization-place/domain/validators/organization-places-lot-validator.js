import { JoiDate } from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import * as categories from '../constants/organization-places-categories.js';

const MINIMUM_DATE_FOR_PLACES_LOT_CREATION = '2015-01-01';

const schema = Joi.object({
  organizationId: Joi.number().integer().required().messages({
    'any.required': `L'organisationId est obligatoire.`,
    'number.base': `L'identifiant de l'organisation doit être un nombre.`,
  }),
  count: Joi.number().integer().positive().required().messages({
    'number.base': `Le nombre de places doit être un nombre sans virgule supérieur à 0.`,
    'number.positive': `Le nombre de places doit être un nombre sans virgule supérieur à 0.`,
    'number.integer': `Le nombre de places doit être un nombre sans virgule supérieur à 0.`,
  }),
  activationDate: Joi.date().format('YYYY-MM-DD').greater(MINIMUM_DATE_FOR_PLACES_LOT_CREATION).required().messages({
    'any.required': `Les dates d'activation et d'expiration sont obligatoires.`,
    'date.greater': `La date d'activation est trop ancienne.`,
    'date.format': `Le format de La date n'est pas correct.`,
  }),
  expirationDate: Joi.date()
    .format('YYYY-MM-DD')
    .required()
    .when('activationDate', {
      is: Joi.exist(),
      then: Joi.date().greater(Joi.ref('activationDate')),
    })
    .messages({
      'any.required': `Les dates d'activation et d'expiration sont obligatoires.`,
      'date.base': `Les dates d'activation et d'expiration sont obligatoires.`,
      'date.greater': `La date d'expiration doit être postérieure à la date d'activation.`,
      'date.format': `Le format de La date n'est pas correct.`,
    }),
  reference: Joi.string().trim().required().messages({
    'any.required': `La référence est obligatoire.`,
    'string.empty': `La référence est obligatoire.`,
    'string.base': `La référence est obligatoire.`,
  }),
  category: Joi.string()
    .valid(categories.T0, categories.T1, categories.T2, categories.T2bis, categories.T3)
    .required()
    .messages({
      'any.required': `La catégorie est obligatoire.`,
    }),
  createdBy: Joi.number().integer().required().messages({
    'any.required': `Le créateur est obligatoire.`,
  }),
});

function validate(organizationPlaces) {
  const { error } = schema.validate(organizationPlaces, { abortEarly: false });
  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }
  return true;
}

export { validate };
