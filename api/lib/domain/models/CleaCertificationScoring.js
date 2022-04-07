const _ = require('lodash');
const PartnerCertificationScoring = require('./PartnerCertificationScoring');
const { NotEligibleCandidateError } = require('../errors');
const Joi = require('joi');
const { validateEntity } = require('../validators/entity-validator');

const {
  MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED,
  MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED,
} = require('../constants');

function _isScoreOver75PercentOfExpectedScore(score, expectedScore) {
  return score >= _.floor(expectedScore * 0.75);
}

function _hasRequiredPixScoreForAtLeast75PercentOfCompetences({ expectedPixByCompetenceForClea, cleaCompetenceMarks }) {
  if (cleaCompetenceMarks.length === 0) return false;

  const countCompetencesWithRequiredPixScore = _(cleaCompetenceMarks)
    .filter(({ score, competenceId }) => {
      const currentCompetenceScore = score;
      const expectedCompetenceScore = expectedPixByCompetenceForClea[competenceId];
      return _isScoreOver75PercentOfExpectedScore(currentCompetenceScore, expectedCompetenceScore);
    })
    .size();

  const minimumCompetenceCountWithRequiredScore = _.floor(cleaCompetenceMarks.length * 0.75);
  return countCompetencesWithRequiredPixScore >= minimumCompetenceCountWithRequiredScore;
}

function _hasSufficientReproducibilityRateToBeTrusted(reproducibilityRate) {
  return reproducibilityRate >= MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED;
}

function _hasNotMinimumReproducibilityRateToBeCertified(reproducibilityRate) {
  return reproducibilityRate <= MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED;
}

class CleaCertificationScoring extends PartnerCertificationScoring {
  constructor({
    complementaryCertificationCourseId,
    hasAcquiredBadge,
    reproducibilityRate,
    cleaCompetenceMarks,
    isBadgeAcquisitionStillValid = true,
    expectedPixByCompetenceForClea,
    cleaBadgeKey,
  } = {}) {
    super({
      complementaryCertificationCourseId,
      partnerKey: cleaBadgeKey,
    });

    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.hasAcquiredBadge = hasAcquiredBadge;
    this.isBadgeAcquisitionStillValid = isBadgeAcquisitionStillValid;
    this.reproducibilityRate = reproducibilityRate;
    this.cleaCompetenceMarks = cleaCompetenceMarks;
    this.expectedPixByCompetenceForClea = expectedPixByCompetenceForClea;

    const schema = Joi.object({
      hasAcquiredBadge: Joi.boolean().required(),
      reproducibilityRate: Joi.number().required(),
      cleaCompetenceMarks: Joi.array().required(),
      expectedPixByCompetenceForClea: Joi.object().required(),
    }).unknown();

    validateEntity(schema, this);
  }

  static buildNotEligible({ complementaryCertificationCourseId }) {
    return new CleaCertificationScoring({
      complementaryCertificationCourseId,
      hasAcquiredBadge: false,
      isBadgeAcquisitionStillValid: false,
      cleaCompetenceMarks: [],
      expectedPixByCompetenceForClea: {},
      reproducibilityRate: 0,
      cleaBadgeKey: 'no_badge',
    });
  }

  isEligible() {
    return this.hasAcquiredBadge && this.isBadgeAcquisitionStillValid;
  }

  setBadgeAcquisitionStillValid(isValid) {
    this.isBadgeAcquisitionStillValid = isValid;
  }

  isAcquired() {
    if (!this.hasAcquiredBadge) throw new NotEligibleCandidateError();

    if (_hasNotMinimumReproducibilityRateToBeCertified(this.reproducibilityRate)) return false;

    if (_hasSufficientReproducibilityRateToBeTrusted(this.reproducibilityRate)) return true;

    return _hasRequiredPixScoreForAtLeast75PercentOfCompetences({
      cleaCompetenceMarks: this.cleaCompetenceMarks,
      expectedPixByCompetenceForClea: this.expectedPixByCompetenceForClea,
    });
  }
}

module.exports = CleaCertificationScoring;
