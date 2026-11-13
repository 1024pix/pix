import { JoiDate } from '@joi/date';
import BaseJoi from 'joi';

const Joi = BaseJoi.extend(JoiDate);

import { EntityValidationError } from '../../../../shared/domain/errors.js';

const MINIMUM_ACTIVATION_DATE = '2015-01-01';

const schema = Joi.object({
  structureId: Joi.number().integer().required().messages({
    'any.required': "L'identifiant de la structure est obligatoire.",
  }),
  count: Joi.number().integer().positive().required().messages({
    'number.base': 'Le nombre de crédits doit être un nombre entier supérieur à 0.',
    'number.positive': 'Le nombre de crédits doit être un nombre entier supérieur à 0.',
    'number.integer': 'Le nombre de crédits doit être un nombre entier supérieur à 0.',
    'any.required': 'Le nombre de crédits est obligatoire.',
  }),
  activationDate: Joi.date().format('YYYY-MM-DD').greater(MINIMUM_ACTIVATION_DATE).required().messages({
    'any.required': "Les dates d'activation et d'expiration sont obligatoires.",
    'date.greater': "La date d'activation est trop ancienne.",
    'date.format': "Le format de la date n'est pas correct.",
  }),
  expirationDate: Joi.date()
    .format('YYYY-MM-DD')
    .required()
    .when('activationDate', {
      is: Joi.date().format('YYYY-MM-DD').required(),
      then: Joi.date().greater(Joi.ref('activationDate')),
    })
    .messages({
      'any.required': "Les dates d'activation et d'expiration sont obligatoires.",
      'date.greater': "La date d'expiration doit être postérieure à la date d'activation.",
      'date.format': "Le format de la date n'est pas correct.",
    }),
  reference: Joi.string().trim().required().messages({
    'any.required': 'La référence est obligatoire.',
    'string.empty': 'La référence est obligatoire.',
  }),
  createdBy: Joi.number().integer().required(),
});

const validate = function (creditLot) {
  const { error } = schema.validate(creditLot, { abortEarly: false });

  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }
};

export { validate };
