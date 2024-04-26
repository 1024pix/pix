import JoiDate from '@joi/date';
import BaseJoi from 'joi';

import { CERTIFICATION_SESSIONS_ERRORS } from '../../../../../lib/domain/constants/sessions-errors.js';
import { types } from '../../../../../lib/domain/models/CertificationCenter.js';
import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';
import { identifiersType } from '../../../../shared/domain/types/identifiers-type.js';
import { SESSION_STATUSES } from '../../../shared/domain/constants.js';
import { CertificationVersion } from '../../../shared/domain/models/CertificationVersion.js';

const Joi = BaseJoi.extend(JoiDate);

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
    .valid(
      SESSION_STATUSES.CREATED,
      SESSION_STATUSES.FINALIZED,
      SESSION_STATUSES.IN_PROCESS,
      SESSION_STATUSES.PROCESSED,
    )
    .optional(),
  certificationCenterName: Joi.string().trim().optional(),
  certificationCenterExternalId: Joi.string().trim().optional(),
  certificationCenterType: Joi.string().trim().valid(types.SUP, types.SCO, types.PRO).optional(),
  version: Joi.number().valid(CertificationVersion.V2, CertificationVersion.V3).optional(),
});

const validate = function (session) {
  const { error } = sessionValidationJoiSchema.validate(session, validationConfiguration);
  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }
};

const validateForMassSessionImport = function (session) {
  const { error } = sessionValidationForMassImportJoiSchema.validate(session, validationConfiguration);
  if (error) {
    return error.details.map(({ message }) => message);
  }
};

const validateAndNormalizeFilters = function (filters) {
  const { value, error } = sessionFiltersValidationSchema.validate(filters, { abortEarly: true });

  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }

  return value;
};

export { validate, validateAndNormalizeFilters, validateForMassSessionImport };
