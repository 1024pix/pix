const isNil = require('lodash/isNil');
const endsWith = require('lodash/endsWith');
const BaseJoi = require('joi');
const JoiDate = require('@joi/date');
const Joi = BaseJoi.extend(JoiDate);
const {
  InvalidCertificationCandidate,
  CertificationCandidatePersonalInfoFieldMissingError,
  CertificationCandidatePersonalInfoWrongFormat,
} = require('../errors.js');

const BILLING_MODES = {
  FREE: 'FREE',
  PAID: 'PAID',
  PREPAID: 'PREPAID',
};

const certificationCandidateValidationJoiSchema_v1_5 = Joi.object({
  firstName: Joi.string().required().empty(null),
  lastName: Joi.string().required().empty(null),
  sex: Joi.string().valid('M', 'F').required().empty(['', null]),
  birthPostalCode: Joi.string().empty(['', null]),
  birthINSEECode: Joi.string().empty(['', null]),
  birthCountry: Joi.string().required().empty(null),
  email: Joi.string().email().allow(null).empty('').optional(),
  resultRecipientEmail: Joi.string().email().empty(['', null]).optional(),
  externalId: Joi.string().allow(null).empty(['', null]).optional(),
  birthdate: Joi.date().format('YYYY-MM-DD').greater('1900-01-01').required().empty(null),
  extraTimePercentage: Joi.number().allow(null).optional(),
  sessionId: Joi.when('$isSessionsMassImport', {
    is: false,
    then: Joi.number().required().empty(['', null]),
  }),
  complementaryCertifications: Joi.array().max(1).required(),
  billingMode: Joi.when('$isSco', {
    is: false,
    then: Joi.string()
      .valid(...Object.values(BILLING_MODES))
      .required(),
  }),
  prepaymentCode: Joi.when('billingMode', {
    is: 'PREPAID',
    then: Joi.string().required().empty(['', null]),
    otherwise: Joi.valid(null),
  }),
}).assert(
  '.birthPostalCode',
  Joi.when('..birthINSEECode', {
    is: Joi.exist(),
    then: Joi.string().forbidden(),
    otherwise: Joi.string().required(),
  })
);

const certificationCandidateValidationForMassImportJoiSchema = Joi.object({
  firstName: Joi.string().required().empty(null).messages({
    'any.required': 'CANDIDATE_FIRST_NAME_REQUIRED',
  }),
  lastName: Joi.string().required().empty(null).messages({
    'any.required': 'CANDIDATE_LAST_NAME_REQUIRED',
  }),
  sex: Joi.string().valid('M', 'F').required().empty(['', null]).messages({
    'any.required': 'CANDIDATE_SEX_REQUIRED',
    'any.only': 'CANDIDATE_SEX_NOT_VALID',
  }),
  birthPostalCode: Joi.string().empty(['', null]).messages({
    'string.empty': 'CANDIDATE_BIRTH_POSTAL_CODE_REQUIRED',
  }),
  birthINSEECode: Joi.string().empty(['', null]).messages({
    'string.empty': 'CANDIDATE_BIRTH_INSEE_CODE_REQUIRED',
  }),
  birthCountry: Joi.string().required().empty(null).messages({
    'any.required': 'CANDIDATE_BIRTH_COUNTRY_REQUIRED',
  }),
  email: Joi.string().email().allow(null).empty('').optional().messages({
    'string.empty': 'CANDIDATE_EMAIL_REQUIRED',
  }),
  resultRecipientEmail: Joi.string().email().empty(['', null]).optional().messages({
    'string.empty': 'CANDIDATE_RESULT_RECIPIENT_EMAIL_REQUIRED',
  }),
  externalId: Joi.string().allow(null).empty(['', null]).optional().messages({
    'string.empty': 'CANDIDATE_EXTERNAL_ID_REQUIRED',
  }),
  birthdate: Joi.date().format('YYYY-MM-DD').greater('1900-01-01').required().empty(null).messages({
    'any.required': 'CANDIDATE_BIRTHDATE_REQUIRED',
    'date.format': 'CANDIDATE_INCORRECT_BIRTHDATE_FORMAT',
  }),
  extraTimePercentage: Joi.number().allow(null).optional().messages({
    'number.base': 'CANDIDATE_EXTRA_TIME_PERCENTAGE_REQUIRED',
  }),
  sessionId: Joi.when('$isSessionsMassImport', {
    is: false,
    then: Joi.number().required().empty(['', null]).messages({
      'string.empty': 'CANDIDATE_SESSION_ID_REQUIRED',
    }),
  }),
  complementaryCertifications: Joi.array().max(1).required().messages({
    'array.max': 'CANDIDATE_MAX_ONE_COMPLEMENTARY_CERTIFICATION',
  }),
  billingMode: Joi.when('$isSco', {
    is: false,
    then: Joi.string()
      .valid(...Object.values(BILLING_MODES))
      .required()
      .empty(['', null])
      .messages({
        'any.required': 'CANDIDATE_BILLING_MODE_REQUIRED',
        'string.base': 'CANDIDATE_BILLING_MUST_BE_A_STRING',
        'any.only': 'CANDIDATE_BILLING_MODE_NOT_VALID',
      }),
  }),
  prepaymentCode: Joi.when('billingMode', {
    is: 'PREPAID',
    then: Joi.string().required().empty(['', null]).messages({
      'string.empty': 'CANDIDATE_PREPAYMENT_CODE_REQUIRED',
    }),
    otherwise: Joi.valid(null).messages({
      'any.only': 'CANDIDATE_BILLING_MODE_MUST_BE_EMPTY',
    }),
  }),
})
  .assert(
    '.birthPostalCode',
    Joi.when('..birthINSEECode', {
      is: Joi.exist(),
      then: Joi.valid(null),
      otherwise: Joi.string().required(),
    })
  )
  .message({
    'object.assert': 'CANDIDATE_BIRTH_INSEE_CODE_OR_BIRTH_POSTAL_CODE_INVALID',
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
  complementaryCertifications: Joi.array(),
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
    complementaryCertifications = [],
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
    this.complementaryCertifications = complementaryCertifications;
    this.billingMode = billingMode;
    this.prepaymentCode = prepaymentCode;
  }

  static translateBillingMode(value) {
    switch (value) {
      case 'FREE':
        return 'Gratuite';
      case 'PAID':
        return 'Payante';
      case 'PREPAID':
        return 'Prépayée';
      case 'Gratuite':
        return 'FREE';
      case 'Payante':
        return 'PAID';
      case 'Prépayée':
        return 'PREPAID';
      case null:
      default:
        return '';
    }
  }

  validate(isSco = false) {
    const { error } = certificationCandidateValidationJoiSchema_v1_5.validate(this, {
      allowUnknown: true,
      context: {
        isSessionsMassImport: false,
        isSco,
      },
    });
    if (error) {
      throw InvalidCertificationCandidate.fromJoiErrorDetail(error.details[0]);
    }
  }

  validateForMassSessionImport({ isSco = false, line }) {
    const { error } = certificationCandidateValidationForMassImportJoiSchema.validate(this, {
      abortEarly: false,
      allowUnknown: true,
      context: {
        isSessionsMassImport: true,
        isSco,
      },
    });
    if (error) {
      return error.details.map(({ message }) => ({ code: message, line }));
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

  get translatedBillingMode() {
    return CertificationCandidate.translateBillingMode(this.billingMode);
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
    return this.complementaryCertifications.some((comp) => comp.key === key);
  }

  isBillingModePrepaid() {
    return this.billingMode === CertificationCandidate.BILLING_MODES.PREPAID;
  }

  convertExtraTimePercentageToDecimal() {
    this.extraTimePercentage = this.extraTimePercentage / 100;
  }
}

CertificationCandidate.BILLING_MODES = BILLING_MODES;

module.exports = CertificationCandidate;
