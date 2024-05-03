import { config } from '../../../../shared/config.js';
import { status as CertificationStatus } from '../../../../shared/domain/models/AssessmentResult.js';

class CertificationAssessmentScoreV3 {
  constructor({ nbPix, percentageCorrectAnswers = 100, status = CertificationStatus.VALIDATED, competenceMarks }) {
    this.nbPix = nbPix;
    this.percentageCorrectAnswers = percentageCorrectAnswers;
    this._status = status;
    this._competenceMarks = competenceMarks;
  }

  static fromChallengesAndAnswers({
    algorithm,
    challenges,
    allAnswers,
    abortReason,
    maxReachableLevelOnCertificationDate,
    v3CertificationScoring = [],
  }) {
    const certificationScoringIntervals = v3CertificationScoring.getIntervals();
    const numberOfIntervals = v3CertificationScoring.getNumberOfIntervals();

    const { capacity } = algorithm.getCapacityAndErrorRate({
      challenges,
      allAnswers,
    });

    const nbPix = _computeScore({
      capacity,
      maxReachableLevelOnCertificationDate,
      certificationScoringIntervals,
      numberOfIntervals,
    });

    const competenceMarks = v3CertificationScoring.getCompetencesScore(capacity);

    const status = _isCertificationRejected({ answers: allAnswers, abortReason })
      ? CertificationStatus.REJECTED
      : CertificationStatus.VALIDATED;

    return new CertificationAssessmentScoreV3({
      nbPix,
      status,
      competenceMarks,
    });
  }

  get status() {
    return this._status;
  }

  get competenceMarks() {
    return this._competenceMarks;
  }

  getPercentageCorrectAnswers() {
    return this.percentageCorrectAnswers;
  }
}

const _findIntervalIndex = (capacity, certificationScoringIntervals) => {
  if (capacity < certificationScoringIntervals[0].bounds.min) {
    return 0;
  }

  for (const [index, { bounds }] of certificationScoringIntervals.entries()) {
    if (bounds.max >= capacity) {
      return index;
    }
  }

  return certificationScoringIntervals.length - 1;
};

const _computeScore = ({ capacity, certificationScoringIntervals }) => {
  const intervalIndex = _findIntervalIndex(capacity, certificationScoringIntervals);

  const diff = capacity - certificationScoringIntervals[intervalIndex].bounds.max;

  const intervalWidth =
    certificationScoringIntervals[intervalIndex].bounds.max - certificationScoringIntervals[intervalIndex].bounds.min;

  return _compute({ certificationScoringIntervals, capacity, intervalIndex, diff, intervalWidth });
};

function _compute({ certificationScoringIntervals, capacity, intervalIndex, diff, intervalWidth }) {
  const MAX_PIX_SCORE = 1024;
  const numberOfIntervals = certificationScoringIntervals.length;
  const SCORE_THRESHOLD = MAX_PIX_SCORE / numberOfIntervals;
  const MAX_REACHABLE_LEVEL = 7;
  const NUMBER_OF_COMPETENCES = 16;
  const MIN_PIX_SCORE = 0;
  const PIX_PER_LEVEL = 8;
  const maximumReachableScore = MAX_REACHABLE_LEVEL * NUMBER_OF_COMPETENCES * PIX_PER_LEVEL - 1;

  if (_isCapacityBelowMinimum(capacity, certificationScoringIntervals)) {
    return MIN_PIX_SCORE;
  }

  if (_isCapacityAboveMaximum(capacity, certificationScoringIntervals)) {
    return maximumReachableScore;
  }

  return _calculateScore({ intervalIndex, diff, intervalWidth, threshold: SCORE_THRESHOLD, maximumReachableScore });
}

function _calculateScore({ intervalIndex, diff, intervalWidth, threshold, maximumReachableScore }) {
  const score = Math.ceil(threshold * (intervalIndex + 1 + diff / intervalWidth)) - 1;

  return Math.min(maximumReachableScore, score);
}

function _isCapacityBelowMinimum(capacity, certificationScoringIntervals) {
  return capacity <= certificationScoringIntervals[0].bounds.min;
}

function _isCapacityAboveMaximum(capacity, certificationScoringIntervals) {
  return capacity >= certificationScoringIntervals.at(-1).bounds.max;
}

const _isCertificationRejected = ({ answers, abortReason }) => {
  return !_hasCandidateAnsweredEnoughQuestions({ answers }) && abortReason;
};

const _hasCandidateAnsweredEnoughQuestions = ({ answers }) => {
  return answers.length >= config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification;
};

export { CertificationAssessmentScoreV3 };
