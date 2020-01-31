const Joi = require('@hapi/joi');
const { EntityValidationError } = require('../errors');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const sessionValidationJoiSchema = Joi.object({

  address: Joi.string()
    .required()
    .messages({
      'string.empty': 'Veuillez donner un nom de site.',
    }),

  room: Joi.string()
    .required()
    .messages({
      'string.empty': 'Veuillez donner un nom de salle.',
    }),

  date: Joi.string()
    .isoDate()
    .required()
    .messages({
      'string.empty': 'Veuillez indiquer une date de début.',
    }),

  time: Joi.string()
    .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.empty': 'Veuillez indiquer une heure de début.',
      'string.pattern.base': 'Veuillez indiquer une heure de début.',
    }),

  examiner: Joi.string()
    .required()
    .messages({
      'string.empty': 'Veuillez indiquer un(e) surveillant(e).',
    }),

});

module.exports = {

  validate(session) {
    const { error } = sessionValidationJoiSchema.validate(session, validationConfiguration);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
};
