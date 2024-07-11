import { COMPETENCES_COUNT, PIX_COUNT_BY_LEVEL } from '../../../../../lib/domain/constants.js';
import { config } from '../../../../shared/config.js';
import { status as CertificationStatus } from '../../../../shared/domain/models/AssessmentResult.js';
import { ABORT_REASONS } from '../../../shared/domain/models/CertificationCourse.js';
import { Intervals } from './Intervals.js';

const weightsAndCoefficients = [
  { weight: 64, coefficient: 0 },
  { weight: 64, coefficient: 1 },
  { weight: 128, coefficient: 1 },
  { weight: 128, coefficient: 2 },
  { weight: 128, coefficient: 3 },
  { weight: 128, coefficient: 4 },
  { weight: 128, coefficient: 5 },
  { weight: 128, coefficient: 6 },
  { weight: 128, coefficient: 7 },
];

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
    allChallenges,
    abortReason,
    maxReachableLevelOnCertificationDate,
    v3CertificationScoring = [],
    scoringDegradationService,
  }) {
    const certificationScoringIntervals = v3CertificationScoring.getIntervals();
    const numberOfIntervals = v3CertificationScoring.getNumberOfIntervals();
    const flashAssessmentAlgorithmConfiguration = algorithm.getConfiguration();

    let { capacity } = algorithm.getCapacityAndErrorRate({
      challenges,
      allAnswers,
    });

    if (_shouldDowngradeCapacity({ flashAssessmentAlgorithmConfiguration, answers: allAnswers, abortReason })) {
      capacity = scoringDegradationService.downgradeCapacity({
        algorithm,
        capacity,
        allChallenges,
        allAnswers,
        flashAssessmentAlgorithmConfiguration,
      });
    }

    const nbPix = _calculateScore({
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

const _calculateScore = ({ capacity, certificationScoringIntervals }) => {
  const MAX_REACHABLE_LEVEL = config.v3Certification.maxReachableLevel;
  const MIN_PIX_SCORE = 0;
  const maximumReachableScore = MAX_REACHABLE_LEVEL * COMPETENCES_COUNT * PIX_COUNT_BY_LEVEL - 1;

  const scoringIntervals = new Intervals({ intervals: certificationScoringIntervals });

  if (scoringIntervals.isCapacityBelowMinimum(capacity)) {
    return MIN_PIX_SCORE;
  }

  if (scoringIntervals.isCapacityAboveMaximum(capacity)) {
    return maximumReachableScore;
  }

  const intervalIndex = scoringIntervals.findIntervalIndex(capacity);
  const intervalMaximum = scoringIntervals.max(intervalIndex);
  const intervalMinimum = scoringIntervals.min(intervalIndex);
  const intervalWeight = weightsAndCoefficients[intervalIndex].weight;
  const intervalCoefficient = weightsAndCoefficients[intervalIndex].coefficient;
  const progressionPercentage = 1 - (intervalMaximum - capacity) / (intervalMaximum - intervalMinimum);
  const score = Math.floor(intervalWeight * (intervalCoefficient + progressionPercentage));

  return Math.min(maximumReachableScore, score);
};

const _isCertificationRejected = ({ answers, abortReason }) => {
  return !_hasCandidateAnsweredEnoughQuestions({ answers }) && abortReason;
};

const _hasCandidateAnsweredEnoughQuestions = ({ answers }) => {
  return answers.length >= config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification;
};

const _hasCandidateCompletedTheCertification = ({ answers, maximumAssessmentLength }) => {
  return answers.length >= maximumAssessmentLength;
};

const _shouldDowngradeCapacity = ({ maximumAssessmentLength, answers, abortReason }) => {
  return (
    _hasCandidateAnsweredEnoughQuestions({ answers }) &&
    !_hasCandidateCompletedTheCertification({ answers, maximumAssessmentLength }) &&
    abortReason === ABORT_REASONS.CANDIDATE
  );
};

CertificationAssessmentScoreV3.weightsAndCoefficients = weightsAndCoefficients;

export { CertificationAssessmentScoreV3 };
