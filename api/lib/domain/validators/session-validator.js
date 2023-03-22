const BaseJoi = require('joi');
const JoiDate = require('@joi/date');
const Joi = BaseJoi.extend(JoiDate);
const { statuses } = require('../models/Session.js');
const { types } = require('../models/CertificationCenter.js');
const { CERTIFICATION_SESSIONS_ERRORS } = require('../constants/sessions-errors');

const { EntityValidationError } = require('../errors.js');
const identifiersType = require('../../domain/types/identifiers-type.js');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const sessionValidationJoiSchema = Joi.object({
  address: Joi.string().required().messages({
    'string.base': CERTIFICATION_SESSIONS_ERRORS.SESSION_ADDRESS_REQUIRED.getMessage(),
    'string.empty': CERTIFICATION_SESSIONS_ERRORS.SESSION_ADDRESS_REQUIRED.getMessage(),
  }),

  room: Joi.string().required().messages({
    'string.base': CERTIFICATION_SESSIONS_ERRORS.SESSION_ROOM_REQUIRED.getMessage(),
    'string.empty': CERTIFICATION_SESSIONS_ERRORS.SESSION_ROOM_REQUIRED.getMessage(),
  }),

  date: Joi.date().format('YYYY-MM-DD').required().empty(['', null]).messages({
    'any.required': CERTIFICATION_SESSIONS_ERRORS.SESSION_DATE_REQUIRED.getMessage(),
    'date.format': CERTIFICATION_SESSIONS_ERRORS.SESSION_DATE_NOT_VALID.getMessage(),
  }),

  time: Joi.string()
    .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.base': CERTIFICATION_SESSIONS_ERRORS.SESSION_TIME_REQUIRED.getMessage(),
      'string.empty': CERTIFICATION_SESSIONS_ERRORS.SESSION_TIME_REQUIRED.getMessage(),
      'string.pattern.base': CERTIFICATION_SESSIONS_ERRORS.SESSION_TIME_REQUIRED.getMessage(),
    }),

  examiner: Joi.string().required().messages({
    'string.base': CERTIFICATION_SESSIONS_ERRORS.SESSION_EXAMINER_REQUIRED.getMessage(),
    'string.empty': CERTIFICATION_SESSIONS_ERRORS.SESSION_EXAMINER_REQUIRED.getMessage(),
  }),
});

const sessionValidationForMassImportJoiSchema = Joi.object({
  address: Joi.string().required().messages({
    'string.base': CERTIFICATION_SESSIONS_ERRORS.SESSION_ADDRESS_REQUIRED.code,
    'string.empty': CERTIFICATION_SESSIONS_ERRORS.SESSION_ADDRESS_REQUIRED.code,
  }),

  room: Joi.string().required().messages({
    'string.base': CERTIFICATION_SESSIONS_ERRORS.SESSION_ROOM_REQUIRED.code,
    'string.empty': CERTIFICATION_SESSIONS_ERRORS.SESSION_ROOM_REQUIRED.code,
  }),

  date: Joi.date().format('YYYY-MM-DD').required().empty(['', null]).messages({
    'any.required': CERTIFICATION_SESSIONS_ERRORS.SESSION_DATE_REQUIRED.code,
    'date.format': CERTIFICATION_SESSIONS_ERRORS.SESSION_DATE_NOT_VALID.code,
  }),

  time: Joi.string()
    .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.base': CERTIFICATION_SESSIONS_ERRORS.SESSION_TIME_REQUIRED.code,
      'string.empty': CERTIFICATION_SESSIONS_ERRORS.SESSION_TIME_REQUIRED.code,
      'string.pattern.base': CERTIFICATION_SESSIONS_ERRORS.SESSION_TIME_NOT_VALID.code,
    }),

  examiner: Joi.string().required().messages({
    'string.base': CERTIFICATION_SESSIONS_ERRORS.SESSION_EXAMINER_REQUIRED.code,
    'string.empty': CERTIFICATION_SESSIONS_ERRORS.SESSION_EXAMINER_REQUIRED.code,
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

  validateForMassSessionImport(session) {
    const { error } = sessionValidationForMassImportJoiSchema.validate(session, validationConfiguration);
    if (error) {
      return error.details.map(({ message }) => message);
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
