import lodash from 'lodash';

import BaseJoi from 'joi';
import JoiDate from '@joi/date';
import {
  CertificationCandidatePersonalInfoFieldMissingError,
  CertificationCandidatePersonalInfoWrongFormat,
  CertificationCandidatesError,
} from '../errors.js';

import { CERTIFICATION_CANDIDATES_ERRORS } from '../constants/certification-candidates-errors.js';

const Joi = BaseJoi.extend(JoiDate);
const { isNil, endsWith } = lodash;

const BILLING_MODES = {
  FREE: 'FREE',
  PAID: 'PAID',
  PREPAID: 'PREPAID',
};

const certificationCandidateValidationJoiSchema = Joi.object({
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

const certificationCandidateParticipationJoiSchema = Joi.object({
  id: Joi.any().allow(null).optional(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  sex: Joi.string().allow(null).optional(),
  birthCity: Joi.any().allow(null).optional(),
  birthProvinceCode: Joi.any().allow(null).optional(),
  birthCountry: Joi.any().allow(null).optional(),
  birthPostalCode: Joi.string().allow(null).optional(),
  birthINSEECode: Joi.string().allow(null).optional(),
  email: Joi.any().allow(null).optional(),
  resultRecipientEmail: Joi.string().email().allow(null).optional(),
  externalId: Joi.any().allow(null).optional(),
  birthdate: Joi.date().format('YYYY-MM-DD').greater('1900-01-01').required(),
  createdAt: Joi.any().allow(null).optional(),
  authorizedToStart: Joi.boolean().optional(),
  extraTimePercentage: Joi.any().allow(null).optional(),
  sessionId: Joi.number().required(),
  userId: Joi.any().allow(null).optional(),
  organizationLearnerId: Joi.any().allow(null).optional(),
  complementaryCertification: Joi.object({
    id: Joi.number().required(),
    label: Joi.string().required().empty(null),
    key: Joi.string().required().empty(null),
  }).allow(null),
  billingMode: Joi.string()
    .valid(...Object.values(BILLING_MODES))
    .empty(null),
  prepaymentCode: Joi.string().allow(null).optional(),
});

class CertificationCandidate {
  constructor({
    id,
    firstName,
    lastName,
    sex,
    birthPostalCode,
    birthINSEECode,
    birthCity,
    birthProvinceCode,
    birthCountry,
    email,
    resultRecipientEmail,
    externalId,
    birthdate,
    extraTimePercentage,
    createdAt,
    authorizedToStart,
    sessionId,
    userId,
    organizationLearnerId = null,
    complementaryCertification = null,
    billingMode = null,
    prepaymentCode = null,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthCity = birthCity;
    this.birthProvinceCode = birthProvinceCode;
    this.birthCountry = birthCountry;
    this.birthPostalCode = birthPostalCode;
    this.birthINSEECode = birthINSEECode;
    this.sex = sex;
    this.email = email;
    this.resultRecipientEmail = resultRecipientEmail;
    this.externalId = externalId;
    this.birthdate = birthdate;
    this.extraTimePercentage = !isNil(extraTimePercentage) ? parseFloat(extraTimePercentage) : extraTimePercentage;
    this.createdAt = createdAt;
    this.authorizedToStart = authorizedToStart;
    this.sessionId = sessionId;
    this.userId = userId;
    this.organizationLearnerId = organizationLearnerId;
    this.complementaryCertification = complementaryCertification;
    this.billingMode = billingMode;
    this.prepaymentCode = prepaymentCode;
  }

  static parseBillingMode({ billingMode, translate }) {
    switch (billingMode) {
      case translate('candidate-list-template.billing-mode.free'):
        return 'FREE';
      case translate('candidate-list-template.billing-mode.paid'):
        return 'PAID';
      case translate('candidate-list-template.billing-mode.prepaid'):
        return 'PREPAID';
      case null:
      default:
        return '';
    }
  }

  static translateBillingMode({ billingMode, translate }) {
    switch (billingMode) {
      case 'FREE':
        return translate('candidate-list-template.billing-mode.free');
      case 'PAID':
        return translate('candidate-list-template.billing-mode.paid');
      case 'PREPAID':
        return translate('candidate-list-template.billing-mode.prepaid');
      case null:
      default:
        return '';
    }
  }

  validate(isSco = false) {
    const { error } = certificationCandidateValidationJoiSchema.validate(this, {
      allowUnknown: true,
      context: {
        isSco,
        isSessionsMassImport: false,
      },
    });
    if (error) {
      throw new CertificationCandidatesError({
        code: error.details?.[0]?.message,
        meta: error.details?.[0]?.context?.value,
      });
    }
  }

  validateForMassSessionImport(isSco = false) {
    const { error } = certificationCandidateValidationJoiSchema.validate(this, {
      abortEarly: false,
      allowUnknown: true,
      context: {
        isSco,
        isSessionsMassImport: true,
      },
    });
    if (error) {
      return error.details.map(({ message }) => message);
    }
  }

  validateParticipation() {
    const { error } = certificationCandidateParticipationJoiSchema.validate(this);
    if (error) {
      if (endsWith(error.details[0].type, 'required')) {
        throw new CertificationCandidatePersonalInfoFieldMissingError();
      }
      throw new CertificationCandidatePersonalInfoWrongFormat();
    }

    if (this.isBillingModePrepaid() && !this.prepaymentCode) {
      throw new CertificationCandidatePersonalInfoFieldMissingError();
    }
  }

  isAuthorizedToStart() {
    return this.authorizedToStart;
  }

  isLinkedToAUser() {
    return !isNil(this.userId);
  }

  isLinkedToUserId(userId) {
    return this.userId === userId;
  }

  updateBirthInformation({ birthCountry, birthINSEECode, birthPostalCode, birthCity }) {
    this.birthCountry = birthCountry;
    this.birthINSEECode = birthINSEECode;
    this.birthPostalCode = birthPostalCode;
    this.birthCity = birthCity;
  }

  isGranted(key) {
    return this.complementaryCertification?.key === key;
  }

  isBillingModePrepaid() {
    return this.billingMode === CertificationCandidate.BILLING_MODES.PREPAID;
  }

  convertExtraTimePercentageToDecimal() {
    this.extraTimePercentage = this.extraTimePercentage / 100;
  }
}

CertificationCandidate.BILLING_MODES = BILLING_MODES;

export { CertificationCandidate };
