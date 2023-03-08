const Joi = require('joi');
const { statuses } = require('../models/Session.js');
const { types } = require('../models/CertificationCenter.js');

const { EntityValidationError } = require('../errors.js');
const identifiersType = require('../../domain/types/identifiers-type.js');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const sessionValidationJoiSchema = Joi.object({
  address: Joi.string().required().messages({
    'string.base': 'Veuillez indiquer un nom de site.',
    'string.empty': 'Veuillez indiquer un nom de site.',
  }),

  room: Joi.string().required().messages({
    'string.base': 'Veuillez indiquer un nom de salle.',
    'string.empty': 'Veuillez indiquer un nom de salle.',
  }),

  date: Joi.string().isoDate().required().messages({
    'string.empty': 'Veuillez indiquer une date de début.',
  }),

  time: Joi.string()
    .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.base': 'Veuillez indiquer une heure de début.',
      'string.empty': 'Veuillez indiquer une heure de début.',
      'string.pattern.base': 'Veuillez indiquer une heure de début.',
    }),

  examiner: Joi.string().required().messages({
    'string.base': 'Veuillez indiquer un(e) surveillant(e).',
    'string.empty': 'Veuillez indiquer un(e) surveillant(e).',
  }),
});

const sessionValidationForMassImportJoiSchema = Joi.object({
  address: Joi.string().required().messages({
    'string.base': 'SESSION_ADDRESS_REQUIRED',
    'string.empty': 'SESSION_ADDRESS_REQUIRED',
  }),

  room: Joi.string().required().messages({
    'string.base': 'SESSION_ROOM_REQUIRED',
    'string.empty': 'SESSION_ROOM_REQUIRED',
  }),

  date: Joi.string().isoDate().required().messages({
    'string.empty': 'SESSION_DATE_REQUIRED',
  }),

  time: Joi.string()
    .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.base': 'SESSION_TIME_REQUIRED',
      'string.empty': 'SESSION_TIME_REQUIRED',
      'string.pattern.base': 'SESSION_TIME_REQUIRED',
    }),

  examiner: Joi.string().required().messages({
    'string.base': 'SESSION_EXAMINER_REQUIRED',
    'string.empty': 'SESSION_EXAMINER_REQUIRED',
  }),
});

const sessionFiltersValidationSchema = Joi.object({
  id: identifiersType.sessionId.optional(),
  status: Joi.string()
    .trim()
    .valid(statuses.CREATED, statuses.FINALIZED, statuses.IN_PROCESS, statuses.PROCESSED)
    .optional(),
  resultsSentToPrescriberAt: Joi.boolean().optional(),
  certificationCenterName: Joi.string().trim().optional(),
  certificationCenterExternalId: Joi.string().trim().optional(),
  certificationCenterType: Joi.string().trim().valid(types.SUP, types.SCO, types.PRO).optional(),
});

module.exports = {
  validate(session) {
    const { error } = sessionValidationJoiSchema.validate(session, validationConfiguration);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  },

  validateForMassSessionImport(session, line) {
    const { error } = sessionValidationForMassImportJoiSchema.validate(session, validationConfiguration);
    if (error) {
      return error.details.map(({ message }) => ({ code: message, line }));
    }
  },

  validateAndNormalizeFilters(filters) {
    const { value, error } = sessionFiltersValidationSchema.validate(filters, { abortEarly: true });

    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }

    return value;
  },
};
