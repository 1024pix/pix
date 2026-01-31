/**
 * @typedef {import('./CalibratedChallenge.js').CalibratedChallenge} CalibratedChallenge
 * @typedef {import('../../../../evaluation/domain/models/Answer.js').Answer} Answer
 * @typedef {import('./FlashAssessmentAlgorithm.js').FlashAssessmentAlgorithm} FlashAssessmentAlgorithm
 * @typedef {import('../services/index.js').ScoringDegradationService} ScoringDegradationService
 * @typedef {import('../../../shared/domain/models/V3CertificationScoring.js').V3CertificationScoring} V3CertificationScoring
 * @typedef {import('../../../shared/domain/models/CompetenceMark.js').CompetenceMark} CompetenceMark
 */

import { config } from '../../../../shared/config.js';
import { COMPETENCES_COUNT, PIX_COUNT_BY_LEVEL } from '../../../../shared/domain/constants.js';
import { status as CertificationStatus } from '../../../../shared/domain/models/AssessmentResult.js';
import { meshConfiguration } from '../../../results/domain/models/v3/MeshConfiguration.js';
import { Intervals } from '../../../scoring/domain/models/Intervals.js';
import { ABORT_REASONS } from '../../../shared/domain/models/CertificationCourse.js';

export class CertificationAssessmentScoreV3 {
  /**
   * @param {object} params
   * @param {number} params.nbPix
   * @param {number} [params.percentageCorrectAnswers=100]
   * @param {CertificationStatus} [params.status=CertificationStatus.VALIDATED]
   * @param {CompetenceMark[]} params.competenceMarks
   */
  constructor({ nbPix, percentageCorrectAnswers = 100, status = CertificationStatus.VALIDATED, competenceMarks }) {
    this.nbPix = nbPix;
    this.percentageCorrectAnswers = percentageCorrectAnswers;
    this._status = status;
    this._competenceMarks = competenceMarks;
  }

  /**
   * @param {object} params
   * @param {FlashAssessmentAlgorithm} params.algorithm
   * @param {CalibratedChallenge[]} params.challenges
   * @param {Answer[]} params.allAnswers
   * @param {CalibratedChallenge[]} params.allChallenges
   * @param {ABORT_REASONS} params.abortReason
   * @param {number} params.maxReachableLevelOnCertificationDate
   * @param {V3CertificationScoring} params.v3CertificationScoring
   * @param {ScoringDegradationService} params.scoringDegradationService
   * @returns {CertificationAssessmentScoreV3}
   */
  static fromChallengesAndAnswers({
    algorithm,
    challenges,
    allAnswers,
    allChallenges,
    abortReason,
    maxReachableLevelOnCertificationDate,
    v3CertificationScoring,
    scoringDegradationService,
  }) {
    const certificationScoringIntervals = v3CertificationScoring.getIntervals();
    const numberOfIntervals = v3CertificationScoring.getNumberOfIntervals();
    const flashAssessmentAlgorithmConfiguration = algorithm.getConfiguration();

    let { capacity } = algorithm.getCapacityAndErrorRate({
      challenges,
      allAnswers,
    });

    if (
      _shouldDowngradeCapacity({
        maximumAssessmentLength: flashAssessmentAlgorithmConfiguration.maximumAssessmentLength,
        answers: allAnswers,
        abortReason,
      })
    ) {
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

  const intervalIndex = scoringIntervals.findIntervalIndexFromCapacity(capacity);
  const intervalMaximum = scoringIntervals.max(intervalIndex);
  const intervalMinimum = scoringIntervals.min(intervalIndex);
  const meshes = Array.from(meshConfiguration.MESH_CONFIGURATION.values());
  const intervalWeight = meshes[intervalIndex].weight;
  const intervalCoefficient = meshes[intervalIndex].coefficient;
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
