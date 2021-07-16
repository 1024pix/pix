const isNil = require('lodash/isNil');
const endsWith = require('lodash/endsWith');
const Joi = require('joi')
  .extend(require('@joi/date'));
const {
  InvalidCertificationCandidate,
  CertificationCandidatePersonalInfoFieldMissingError,
  CertificationCandidatePersonalInfoWrongFormat,
} = require('../errors');

const certificationCandidateValidationJoiSchema_v1_4 = Joi.object({
  firstName: Joi.string().required().empty(null),
  lastName: Joi.string().required().empty(null),
  birthCity: Joi.string().required().empty(null),
  birthProvinceCode: Joi.string().required().empty(null),
  birthCountry: Joi.string().required().empty(null),
  email: Joi.string().email().allow(null).optional(),
  resultRecipientEmail: Joi.string().email().allow(null).optional(),
  externalId: Joi.string().allow(null).optional(),
  birthdate: Joi.date().format('YYYY-MM-DD').greater('1900-01-01').required().empty(null),
  extraTimePercentage: Joi.number().allow(null).optional(),
  sessionId: Joi.number().required().empty(null),
});

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
  extraTimePercentage: Joi.any().allow(null).optional(),
  sessionId: Joi.number().required(),
  userId: Joi.any().allow(null).optional(),
  schoolingRegistrationId: Joi.any().allow(null).optional(),
});

class CertificationCandidate {
  constructor(
    {
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
      sessionId,
      userId,
      schoolingRegistrationId = null,
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
    this.sessionId = sessionId;
    this.userId = userId;
    this.schoolingRegistrationId = schoolingRegistrationId;
  }

  validate(version = '1.4') {
    const err = {};
    let usedSchema = null;
    switch (version) {
      case '1.4':
        usedSchema = certificationCandidateValidationJoiSchema_v1_4;
        break;
      case '1.5':
        usedSchema = certificationCandidateValidationJoiSchema_v1_5;
        break;
      default:
        err.key = 'version';
        err.why = 'unknown';
        throw new InvalidCertificationCandidate({ error: err });
    }

    const { error } = usedSchema.validate(this, { allowUnknown: true });
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
}

module.exports = CertificationCandidate;
