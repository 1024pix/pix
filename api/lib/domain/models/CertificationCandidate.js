const _ = require('lodash');
const Joi = require('joi');
const { InvalidCertificationCandidate } = require('../errors');

const certificationCandidateValidationJoiSchema = Joi.object().keys({
  id: Joi.number().optional(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  birthplace: Joi.string().required(),
  externalId: Joi.string().allow(null).optional(),
  birthdate: Joi.string().length(10).required(),
  createdAt: Joi.any().allow(null).optional(),
  extraTimePercentage: Joi.number().allow(null).optional(),
  sessionId: Joi.number().required(),
});

class CertificationCandidate {
  constructor(
    {
      id,
      // attributes
      firstName,
      lastName,
      birthplace,
      externalId,
      birthdate,
      createdAt,
      extraTimePercentage,
      // includes
      // references
      sessionId,
    } = {}) {
    this.id = id;
    // attributes
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthplace = birthplace;
    this.externalId = externalId;
    this.birthdate = birthdate;
    this.createdAt = createdAt;
    this.extraTimePercentage = !_.isNil(extraTimePercentage) ? parseFloat(extraTimePercentage) : extraTimePercentage;
    // includes
    // references
    this.sessionId = sessionId;
  }

  validate() {
    const result = Joi.validate(this, certificationCandidateValidationJoiSchema);
    if (result.error !== null) {
      throw new InvalidCertificationCandidate();
    }
  }
}

module.exports = CertificationCandidate;
