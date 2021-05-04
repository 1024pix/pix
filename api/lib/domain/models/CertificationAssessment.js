const Joi = require('joi')
  .extend(require('@joi/date'));
const { validateEntity } = require('../validators/entity-validator');
const _ = require('lodash');
const { ChallengeToBeNeutralizedNotFoundError, ChallengeToBeDeneutralizedNotFoundError } = require('../errors');

const states = {
  COMPLETED: 'completed',
  STARTED: 'started',
};

const certificationAssessmentSchema = Joi.object({
  id: Joi.number().integer().required(),
  userId: Joi.number().integer().required(),
  certificationCourseId: Joi.number().integer().required(),
  createdAt: Joi.date().required(),
  completedAt: Joi.date().allow(null),
  state: Joi.string().valid(states.COMPLETED, states.STARTED).required(),
  isV2Certification: Joi.boolean().required(),
  certificationChallenges: Joi.array().min(1).required(),
  certificationAnswersByDate: Joi.array().min(0).required(),
});

class CertificationAssessment {

  constructor({
    id,
    userId,
    certificationCourseId,
    createdAt,
    completedAt,
    state,
    isV2Certification,
    certificationChallenges,
    certificationAnswersByDate,
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.certificationCourseId = certificationCourseId;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.state = state;
    this.isV2Certification = isV2Certification;
    this.certificationChallenges = certificationChallenges;
    this.certificationAnswersByDate = certificationAnswersByDate;

    validateEntity(certificationAssessmentSchema, this);
  }

  getCertificationChallenge(challengeId) {
    return _.find(this.certificationChallenges, { challengeId }) || null;
  }

  neutralizeChallengeByRecId(recId) {
    const challengeToBeNeutralized = _.find(this.certificationChallenges, { challengeId: recId });
    if (challengeToBeNeutralized) {
      challengeToBeNeutralized.neutralize();
    } else {
      throw new ChallengeToBeNeutralizedNotFoundError();
    }
  }

  deneutralizeChallengeByRecId(recId) {
    const challengeToBeDeneutralized = _.find(this.certificationChallenges, { challengeId: recId });
    if (challengeToBeDeneutralized) {
      challengeToBeDeneutralized.deneutralize();
    } else {
      throw new ChallengeToBeDeneutralizedNotFoundError();
    }
  }

  listCertifiableBadgeKeysTaken() {
    return _(this.certificationChallenges)
      .filter((certificationChallenge) => certificationChallenge.isPixPlus())
      .uniqBy('certifiableBadgeKey')
      .map('certifiableBadgeKey')
      .value();
  }

  findAnswersForCertifiableBadgeKey(certifiableBadgeKey) {
    const certificationChallengesForBadge = _.filter(this.certificationChallenges, { certifiableBadgeKey });
    const challengeIds = _.map(certificationChallengesForBadge, 'challengeId');
    return _.filter(this.certificationAnswersByDate, ({ challengeId }) => _.includes(challengeIds, challengeId));
  }

  isCompleted() {
    return this.state === states.COMPLETED;
  }
}

CertificationAssessment.states = states;

module.exports = CertificationAssessment;
