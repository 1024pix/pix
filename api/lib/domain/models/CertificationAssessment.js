const _ = require('lodash');
const { states } = require('./Assessment');
const { ObjectValidationError } = require('../errors');

class CertificationAssessment {
  constructor({
    id,
    userId,
    certificationCourseId,
    createdAt,
    completedAt,
    state,
    isV2Certification,
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.certificationCourseId = certificationCourseId;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.state = state;
    if (!_.keys(states).includes(this.state)) {
      new ObjectValidationError(`CertificationAssessment : wrong state ${this.state}`);
    }
    this.isV2Certification = isV2Certification;
    this.certificationChallenges = [];
    this.certificationAnswers = [];
  }
}

CertificationAssessment.states = states;

module.exports = CertificationAssessment;
