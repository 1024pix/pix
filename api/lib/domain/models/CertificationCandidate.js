const _ = require('lodash');
const Joi = require('@hapi/joi')
  .extend(require('@hapi/joi-date'));
const { InvalidCertificationCandidate } = require('../errors');
const CertificationCourse = require('./CertificationCourse');

const certificationCandidateValidationJoiSchema_v1_1 = Joi.object({
  id: Joi.number().optional(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  birthCity: Joi.string().required(),
  birthProvinceCode: Joi.string().required(),
  birthCountry: Joi.string().required(),
  email: Joi.string().optional(),
  externalId: Joi.string().allow(null).optional(),
  birthdate: Joi.date().format('YYYY-MM-DD').greater('1900-01-01').required(),
  createdAt: Joi.any().allow(null).optional(),
  extraTimePercentage: Joi.number().allow(null).optional(),
  certificationCourse: Joi.object().instance(CertificationCourse).allow(null).optional(),
  sessionId: Joi.number().allow(null).optional(),
  userId: Joi.number().allow(null).optional(),
});

// Same as v1_1 but with email
const certificationCandidateValidationJoiSchema_v1_2 = Joi.object({
  id: Joi.number().optional(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  birthCity: Joi.string().required(),
  birthProvinceCode: Joi.string().required(),
  birthCountry: Joi.string().required(),
  email: Joi.string().email().allow(null).optional(),
  externalId: Joi.string().allow(null).optional(),
  birthdate: Joi.date().format('YYYY-MM-DD').greater('1900-01-01').required(),
  createdAt: Joi.any().allow(null).optional(),
  extraTimePercentage: Joi.number().allow(null).optional(),
  certificationCourse: Joi.object().instance(CertificationCourse).allow(null).optional(),
  sessionId: Joi.number().allow(null).optional(),
  userId: Joi.number().allow(null).optional(),
});

const certificationCandidateParticipationJoiSchema = Joi.object({
  id: Joi.any().allow(null).optional(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  birthCity: Joi.any().allow(null).optional(),
  birthProvinceCode: Joi.any().allow(null).optional(),
  birthCountry: Joi.any().allow(null).optional(),
  email: Joi.any().allow(null).optional(),
  externalId: Joi.any().allow(null).optional(),
  birthdate: Joi.date().format('YYYY-MM-DD').greater('1900-01-01').required(),
  createdAt: Joi.any().allow(null).optional(),
  extraTimePercentage: Joi.any().allow(null).optional(),
  certificationCourse: Joi.object().instance(CertificationCourse).allow(null).optional(),
  sessionId: Joi.number().required(),
  userId: Joi.any().allow(null).optional(),
});

class CertificationCandidate {
  constructor(
    {
      id,
      // attributes
      firstName,
      lastName,
      birthCity,
      birthProvinceCode,
      birthCountry,
      email,
      externalId,
      birthdate,
      extraTimePercentage,
      createdAt,
      // includes
      certificationCourse,
      // references
      sessionId,
      userId,
    } = {}) {
    this.id = id;
    // attributes
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthCity = birthCity;
    this.birthProvinceCode = birthProvinceCode;
    this.birthCountry = birthCountry;
    this.email = email;
    this.externalId = externalId;
    this.birthdate = birthdate;
    this.extraTimePercentage = !_.isNil(extraTimePercentage) ? parseFloat(extraTimePercentage) : extraTimePercentage;
    this.createdAt = createdAt;
    // includes
    this.certificationCourse = certificationCourse;
    // references
    this.sessionId = sessionId;
    this.userId = userId;
  }

  validate(version = '1.3') {
    let usedSchema = null;
    switch (version) {
      case '1.3':
      case '1.2':
        usedSchema = certificationCandidateValidationJoiSchema_v1_2;
        break;
      case '1.1':
        usedSchema = certificationCandidateValidationJoiSchema_v1_1;
        break;
      default:
        throw new InvalidCertificationCandidate();
    }

    const { error } = usedSchema.validate(this);
    if (error) {
      throw new InvalidCertificationCandidate();
    }
  }

  validateParticipation() {
    const { error } = certificationCandidateParticipationJoiSchema.validate(this);
    if (error) {
      throw error;
    }
  }
}

module.exports = CertificationCandidate;
