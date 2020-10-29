const Joi = require('@hapi/joi')
  .extend(require('@hapi/joi-date'));
const { InvalidCertificationCandidate } = require('../errors');

const scoCertificationCandidateValidationJoiSchema = Joi.object({
  firstName: Joi.string().required().empty(null),
  lastName: Joi.string().required().empty(null),
  birthdate: Joi.date().format('YYYY-MM-DD').greater('1900-01-01').required().empty(null),
  sessionId: Joi.number().required().empty(null),
  schoolingRegistrationId: Joi.number().required().empty(null),
});

class SCOCertificationCandidate {
  constructor(
    {
      id,
      firstName,
      lastName,
      birthdate,
      sessionId,
      schoolingRegistrationId,
    } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
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
