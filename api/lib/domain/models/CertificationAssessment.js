const Joi = require('joi')
  .extend(require('@joi/date'));
const { validateEntity } = require('../validators/entity-validator');
const _ = require('lodash');
const { ChallengeToBeNeutralizedNotFoundError, ChallengeToBeDeneutralizedNotFoundError } = require('../errors');
const AnswerStatus = require('./AnswerStatus');
const NeutralizationAttempt = require('./NeutralizationAttempt');

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
  _certificationChallengesWithIndex: Joi.array().min(1).required(),
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
    certificationChallengesWithIndex,
    certificationAnswersByDate,
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.certificationCourseId = certificationCourseId;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.state = state;
    this.isV2Certification = isV2Certification;
    this._certificationChallengesWithIndex = certificationChallengesWithIndex;
    this.certificationAnswersByDate = certificationAnswersByDate;

    validateEntity(certificationAssessmentSchema, this);
  }

  getCertificationChallenge(challengeId) {
    return _.find(this.listCertificationChallenges(), { challengeId }) || null;
  }

  listCertificationChallenges() {
    return _.map(this._certificationChallengesWithIndex, 'certificationChallenge');
  }

  neutralizeChallengeByRecId(recId) {
    const challengeToBeNeutralized = _.find(this.listCertificationChallenges(), { challengeId: recId });
    if (challengeToBeNeutralized) {
      challengeToBeNeutralized.neutralize();
    } else {
      throw new ChallengeToBeNeutralizedNotFoundError();
    }
  }

  neutralizeChallengeByNumberIfKoOrSkippedOrPartially(questionNumber) {
    const toBeNeutralizedChallengeAnswer = this.certificationAnswersByDate[questionNumber - 1];
    if (!toBeNeutralizedChallengeAnswer) {
      return NeutralizationAttempt.failure(questionNumber);
    }

    if (_isAnswerKoOrSkippedOrPartially(toBeNeutralizedChallengeAnswer.result.status)) {
      const challengeToBeNeutralized = _.find(this.listCertificationChallenges(), { challengeId: toBeNeutralizedChallengeAnswer.challengeId });
      challengeToBeNeutralized.neutralize();
      return NeutralizationAttempt.neutralized(questionNumber);
    }

    return NeutralizationAttempt.skipped(questionNumber);
  }

  deneutralizeChallengeByRecId(recId) {
    const challengeToBeDeneutralized = _.find(this.listCertificationChallenges(), { challengeId: recId });
    if (challengeToBeDeneutralized) {
      challengeToBeDeneutralized.deneutralize();
    } else {
      throw new ChallengeToBeDeneutralizedNotFoundError();
    }
  }

  listCertifiableBadgeKeysTaken() {
    return _(this.listCertificationChallenges())
      .filter((certificationChallenge) => certificationChallenge.isPixPlus())
      .uniqBy('certifiableBadgeKey')
      .map('certifiableBadgeKey')
      .value();
  }

  findAnswersAndChallengesForCertifiableBadgeKey(certifiableBadgeKey) {
    const certificationChallengesForBadge = _.filter(this.listCertificationChallenges(), { certifiableBadgeKey });
    const challengeIds = _.map(certificationChallengesForBadge, 'challengeId');
    const answersForBadge = _.filter(this.certificationAnswersByDate, ({ challengeId }) => _.includes(challengeIds, challengeId));
    return {
      certificationChallenges: certificationChallengesForBadge,
      certificationAnswers: answersForBadge,
    };
  }

  isCompleted() {
    return this.state === states.COMPLETED;
  }

  getChallengeRecIdByQuestionNumber(questionNumber) {
    return this.certificationAnswersByDate[questionNumber - 1]?.challengeId || null;
  }
}

function _isAnswerKoOrSkippedOrPartially(answerStatus) {
  const isKo = AnswerStatus.isKO(answerStatus);
  const isSkipped = AnswerStatus.isSKIPPED(answerStatus);
  const isPartially = AnswerStatus.isPARTIALLY(answerStatus);
  return (isKo || isSkipped || isPartially);
}

CertificationAssessment.states = states;

module.exports = CertificationAssessment;
