import BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);
import { InvalidCertificationCandidate } from '../errors';

const scoCertificationCandidateValidationJoiSchema = Joi.object({
  firstName: Joi.string().required().empty(null),
  lastName: Joi.string().required().empty(null),
  birthdate: Joi.date().format('YYYY-MM-DD').greater('1900-01-01').required().empty(null),
  birthINSEECode: Joi.string().allow(null).optional(),
  birthCountry: Joi.string().allow(null).optional(),
  birthCity: Joi.string().allow(null, '').optional(),
  sex: Joi.string().allow(null).optional(),
  sessionId: Joi.number().required().empty(null),
  organizationLearnerId: Joi.number().required().empty(null),
});

class SCOCertificationCandidate {
  constructor({
    id,
    firstName,
    lastName,
    birthdate,
    birthINSEECode,
    birthCountry,
    birthCity,
    sex,
    sessionId,
    organizationLearnerId,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.birthINSEECode = birthINSEECode;
    this.birthCountry = birthCountry;
    this.birthCity = birthCity;
    this.sex = sex;
    this.sessionId = sessionId;
    this.organizationLearnerId = organizationLearnerId;
    this.validate();
  }

  validate() {
    const { error } = scoCertificationCandidateValidationJoiSchema.validate(this, { allowUnknown: true });
    if (error) {
      throw InvalidCertificationCandidate.fromJoiErrorDetail(error.details[0]);
    }
  }
}

export default SCOCertificationCandidate;
