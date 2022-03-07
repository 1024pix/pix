const isNil = require('lodash/isNil');
const endsWith = require('lodash/endsWith');
const Joi = require('joi').extend(require('@joi/date'));
const { PIX_PLUS_DROIT, CLEA } = require('./ComplementaryCertification');
const {
  InvalidCertificationCandidate,
  CertificationCandidatePersonalInfoFieldMissingError,
  CertificationCandidatePersonalInfoWrongFormat,
} = require('../errors');
const { featureToggles } = require('../../config');

const BILLING_MODES = {
  FREE: 'FREE',
  PAID: 'PAID',
  PREPAID: 'PREPAID',
};

const certificationCandidateValidationJoiSchema_v1_5 = Joi.object({
  firstName: Joi.string().required().empty(null),
  lastName: Joi.string().required().empty(null),
  sex: Joi.string().valid('M', 'F').required().empty(null),
  birthPostalCode: Joi.string().empty(null),
  birthINSEECode: Joi.string().empty(null),
  birthCountry: Joi.string().required().empty(null),
  email: Joi.string().email().allow(null).optional(),
  resultRecipientEmail: Joi.string().email().allow(null).optional(),
  externalId: Joi.string().allow(null).optional(),
  birthdate: Joi.date().format('YYYY-MM-DD').greater('1900-01-01').required().empty(null),
  extraTimePercentage: Joi.number().allow(null).optional(),
  sessionId: Joi.number().required().empty(null),
  complementaryCertifications: Joi.array().required(),
  billingMode: Joi.when('$isCertificationBillingEnabled', {
    is: true,
    then: Joi.when('$isSco', {
      is: false,
      then: Joi.string()
        .valid(...Object.values(BILLING_MODES))
        .required(),
    }),
    otherwise: Joi.valid(null),
  }),
  prepaymentCode: Joi.when('billingMode', {
    is: 'PREPAID',
    then: Joi.string().required().empty(null),
    otherwise: Joi.valid(null),
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
  schoolingRegistrationId: Joi.any().allow(null).optional(),
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
    schoolingRegistrationId = null,
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
    this.schoolingRegistrationId = schoolingRegistrationId;
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
        isCertificationBillingEnabled: featureToggles.isCertificationBillingEnabled,
        isSco,
      },
    });
    if (error) {
      throw InvalidCertificationCandidate.fromJoiErrorDetail(error.details[0]);
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

  isGrantedPixPlusDroit() {
    return this.complementaryCertifications.find((comp) => comp.name === PIX_PLUS_DROIT);
  }

  isGrantedCleA() {
    return this.complementaryCertifications.find((comp) => comp.name === CLEA);
  }

  isBillingModePrepaid() {
    return this.billingMode === CertificationCandidate.BILLING_MODES.PREPAID;
  }
}

CertificationCandidate.BILLING_MODES = BILLING_MODES;

module.exports = CertificationCandidate;
