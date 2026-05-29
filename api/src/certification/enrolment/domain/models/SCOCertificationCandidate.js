import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';
import { InvalidCertificationCandidate } from '../errors.js';
import { Subscription } from './Subscription.js';

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
    this.subscriptions = [Subscription.buildCore({ certificationCandidateId: null })];
    this.subscription = Frameworks.CORE;
    this.validate();
  }

  validate() {
    const { error } = scoCertificationCandidateValidationJoiSchema.validate(this, { allowUnknown: true });
    if (error) {
      throw InvalidCertificationCandidate.fromJoiErrorDetail(error.details[0]);
    }
  }

  toDTO() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      sex: this.sex,
      birthINSEECode: this.birthINSEECode,
      birthCity: this.birthCity,
      birthCountry: this.birthCountry,
      birthdate: this.birthdate,
      subscription: this.subscription,
      sessionId: this.sessionId,
      organizationLearnerId: this.organizationLearnerId,
    };
  }
}

export { SCOCertificationCandidate };
