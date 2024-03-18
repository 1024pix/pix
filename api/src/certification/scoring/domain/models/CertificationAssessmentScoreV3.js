import { config } from '../../../../shared/config.js';
import { status as CertificationStatus } from '../../../../shared/domain/models/AssessmentResult.js';

const MINIMUM_ESTIMATED_LEVEL = -8;
const MAXIMUM_ESTIMATED_LEVEL = 8;

const MAX_PIX_SCORE = 1024;
const NUMBER_OF_COMPETENCES = 16;
const PIX_PER_LEVEL = 8;

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
    const intervalHeight = MAX_PIX_SCORE / numberOfIntervals;

    const { estimatedLevel } = algorithm.getEstimatedLevelAndErrorRate({
      challenges,
      allAnswers,
    });

    const nbPix = _computeScore({
      estimatedLevel,
      maxReachableLevelOnCertificationDate,
      certificationScoringIntervals,
      numberOfIntervals,
      intervalHeight,
    });

    const competenceMarks = v3CertificationScoring.getCompetencesScore(estimatedLevel);

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

const _findIntervalIndex = (estimatedLevel, certificationScoringIntervals) =>
  certificationScoringIntervals.findIndex(({ bounds }) => estimatedLevel <= bounds.max && estimatedLevel >= bounds.min);

const _computeScore = ({
  estimatedLevel,
  maxReachableLevelOnCertificationDate,
  certificationScoringIntervals,
  intervalHeight,
}) => {
  let normalizedEstimatedLevel = estimatedLevel;

  if (normalizedEstimatedLevel < MINIMUM_ESTIMATED_LEVEL) {
    normalizedEstimatedLevel = MINIMUM_ESTIMATED_LEVEL;
  }
  if (normalizedEstimatedLevel > MAXIMUM_ESTIMATED_LEVEL) {
    normalizedEstimatedLevel = MAXIMUM_ESTIMATED_LEVEL;
  }

  const intervalIndex = _findIntervalIndex(normalizedEstimatedLevel, certificationScoringIntervals);

  const intervalMaxValue = certificationScoringIntervals[intervalIndex].bounds.max;
  const intervalWidth =
    certificationScoringIntervals[intervalIndex].bounds.max - certificationScoringIntervals[intervalIndex].bounds.min;

  // Formula is defined here : https://1024pix.atlassian.net/wiki/spaces/DD/pages/3835133953/Vulgarisation+score+2023#Le-score
  const score = intervalHeight * (intervalIndex + 1 + (normalizedEstimatedLevel - intervalMaxValue) / intervalWidth);

  const maximumReachableScore = maxReachableLevelOnCertificationDate * NUMBER_OF_COMPETENCES * PIX_PER_LEVEL;

  const limitedScore = Math.min(maximumReachableScore, score);

  return Math.round(limitedScore);
};

const _isCertificationRejected = ({ answers, abortReason }) => {
  return !_hasCandidateAnsweredEnoughQuestions({ answers }) && abortReason;
};

const _hasCandidateAnsweredEnoughQuestions = ({ answers }) => {
  return answers.length >= config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification;
};

export { CertificationAssessmentScoreV3 };
