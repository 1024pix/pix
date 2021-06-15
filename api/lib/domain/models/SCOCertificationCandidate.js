const Joi = require('joi')
  .extend(require('@joi/date'));
const { InvalidCertificationCandidate } = require('../errors');

const scoCertificationCandidateValidationJoiSchema = Joi.object({
  firstName: Joi.string().required().empty(null),
  lastName: Joi.string().required().empty(null),
  birthdate: Joi.date().format('YYYY-MM-DD').greater('1900-01-01').required().empty(null),
  birthINSEECode: Joi.string().allow(null).optional(),
  sex: Joi.string().allow(null).optional(),
  sessionId: Joi.number().required().empty(null),
  schoolingRegistrationId: Joi.number().required().empty(null),
});

class SCOCertificationCandidate {
  constructor({
    id,
    firstName,
    lastName,
    birthdate,
    birthINSEECode,
    sex,
    sessionId,
    schoolingRegistrationId,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.birthINSEECode = birthINSEECode;
    this.sex = sex;
    this.sessionId = sessionId;
    this.schoolingRegistrationId = schoolingRegistrationId;
    this.validate();
  }

  validate() {
    const { error } = scoCertificationCandidateValidationJoiSchema.validate(this, { allowUnknown: true });
    if (error) {
      throw InvalidCertificationCandidate.fromJoiErrorDetail(error.details[0]);
    }
  }
}

module.exports = SCOCertificationCandidate;
