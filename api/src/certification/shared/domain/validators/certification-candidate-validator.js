import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../lib/domain/constants/certification-candidates-errors.js';
import { subscriptionSchema } from './subscription-validator.js';

const BILLING_MODES = {
  FREE: 'FREE',
  PAID: 'PAID',
  PREPAID: 'PREPAID',
};

const schema = Joi.object({
  firstName: Joi.string().trim().required().empty(['', null]).messages({
    'any.required': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_FIRST_NAME_REQUIRED.code,
    'string.base': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_FIRST_NAME_MUST_BE_A_STRING.code,
  }),
  lastName: Joi.string().trim().required().empty(['', null]).messages({
    'any.required': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_LAST_NAME_REQUIRED.code,
    'string.base': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_LAST_NAME_MUST_BE_A_STRING.code,
  }),
  sex: Joi.string().valid('M', 'F').required().empty(['', null]).messages({
    'any.required': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_SEX_REQUIRED.code,
    'any.only': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_SEX_NOT_VALID.code,
  }),
  email: Joi.string().email().allow(null).empty('').optional().messages({
    'string.email': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_EMAIL_NOT_VALID.code,
  }),
  resultRecipientEmail: Joi.string().email().empty(['', null]).optional().messages({
    'string.email': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID.code,
  }),
  externalId: Joi.string().allow(null).empty(['', null]).optional().messages({
    'string.base': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_EXTERNAL_ID_MUST_BE_A_STRING.code,
  }),
  birthdate: Joi.date().format('YYYY-MM-DD').greater('1900-01-01').required().empty(['', null]).messages({
    'any.required': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTHDATE_REQUIRED.code,
    'date.format': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTHDATE_FORMAT_NOT_VALID.code,
    'date.greater': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTHDATE_MUST_BE_GREATER.code,
  }),
  extraTimePercentage: Joi.number().allow(null).optional().min(0).less(10).messages({
    'number.base': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_EXTRA_TIME_INTEGER.code,
    'number.min': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_EXTRA_TIME_OUT_OF_RANGE.code,
    'number.less': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_EXTRA_TIME_OUT_OF_RANGE.code,
  }),
  sessionId: Joi.when('$isSessionsMassImport', {
    is: false,
    then: Joi.number().required().empty(['', null]).messages({
      'any.required': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_SESSION_ID_REQUIRED.code,
      'number.base': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_SESSION_ID_NOT_A_NUMBER.code,
    }),
  }),
  complementaryCertification: Joi.object({
    id: Joi.number().required(),
    label: Joi.string().required().empty(null),
    key: Joi.string().required().empty(null),
  }).allow(null),
  subscriptions: Joi.array().items(subscriptionSchema).unique('type').required(),
  billingMode: Joi.when('$isSco', {
    is: false,
    then: Joi.string()
      .valid(...Object.values(BILLING_MODES))
      .required()
      .empty(['', null])
      .messages({
        'any.required': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BILLING_MODE_REQUIRED.code,
        'string.base': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BILLING_MODE_MUST_BE_A_STRING.code,
        'any.only': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BILLING_MODE_NOT_VALID.code,
      }),
    otherwise: Joi.valid(null).messages({
      'any.only': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BILLING_MODE_MUST_BE_EMPTY.code,
    }),
  }),
  prepaymentCode: Joi.when('billingMode', {
    is: 'PREPAID',
    then: Joi.string().trim().required().empty(['', null]).messages({
      'any.required': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_PREPAYMENT_CODE_REQUIRED.code,
    }),
    otherwise: Joi.valid(null).messages({
      'any.only': CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_PREPAYMENT_CODE_MUST_BE_EMPTY.code,
    }),
  }),
});

function validate(certificationCandidate, options = { allowUnknown: true }) {
  return schema.validate(certificationCandidate, options);
}

export { validate };
