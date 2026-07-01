/**
 * @typedef {import('./CalibratedChallenge.js').CalibratedChallenge} CalibratedChallenge
 * @typedef {import('../../../../evaluation/domain/models/Answer.js').Answer} Answer
 * @typedef {import('./FlashAssessmentAlgorithm.js').FlashAssessmentAlgorithm} FlashAssessmentAlgorithm
 * @typedef {import('./V3CertificationScoring.js').V3CertificationScoring} V3CertificationScoring
 * @typedef {import('../../../shared/domain/models/CompetenceMark.js').CompetenceMark} CompetenceMark
 */

import { COMPETENCES_COUNT, PIX_COUNT_BY_LEVEL } from '../../../../shared/constants.js';
import { CORE_MESH_CONFIGURATION } from '../../../shared/domain/constants/mesh-configuration.js';
import { Intervals } from './Intervals.js';

export class ScoringV3Algorithm {
  /**
   *  @param {object} params
   *  @param {FlashAssessmentAlgorithm} params.algorithm
   *  @param {Answer[]} params.allAnswers
   *  @param {CalibratedChallenge[]} params.allChallenges
   *  @param {CalibratedChallenge[]} params.askedChallenges
   *  @param {V3CertificationScoring} params.v3CertificationScoring
   *  @param {Function} params.downgradeCapacityFunction
   */
  constructor({
    algorithm,
    allAnswers,
    allChallenges,
    askedChallenges,
    v3CertificationScoring,
    downgradeCapacityFunction,
  }) {
    this.algorithm = algorithm;
    this.allAnswers = allAnswers;
    this.allChallenges = allChallenges;
    this.askedChallenges = askedChallenges;
    this.v3CertificationScoring = v3CertificationScoring;
    this.downgradeCapacityFunction = downgradeCapacityFunction;
  }

  /**
   *  @param {object} params
   *  @param {boolean} params.shouldDowngradeCapacity
   *  @returns {number} capacity
   */
  computeCapacity({ shouldDowngradeCapacity }) {
    const flashAssessmentAlgorithmConfiguration = this.algorithm.getConfiguration();

    let { capacity } = this.algorithm.getCapacityAndErrorRate({
      challenges: this.askedChallenges,
      allAnswers: this.allAnswers,
    });

    if (shouldDowngradeCapacity) {
      capacity = this.downgradeCapacityFunction({
        algorithm: this.algorithm,
        capacity,
        allChallenges: this.allChallenges,
        allAnswers: this.allAnswers,
        flashAssessmentAlgorithmConfiguration,
      });
    }

    return capacity;
  }

  /**
   *  @param {object} params
   *  @param {number} params.capacity
   *  @returns {number} pixScore
   */
  computePixScoreFromCapacity({ capacity }) {
    const certificationScoringIntervals = this.v3CertificationScoring.intervals;
    const maxReachableLevel = this.v3CertificationScoring.maxReachableLevel;
    const maximumReachableScore = maxReachableLevel * COMPETENCES_COUNT * PIX_COUNT_BY_LEVEL - 1;

    const scoringIntervals = new Intervals({ intervals: certificationScoringIntervals });

    if (scoringIntervals.isCapacityAboveMaximum(capacity)) {
      return maximumReachableScore;
    }

    const intervalIndex = scoringIntervals.findIntervalIndexFromCapacity(capacity);
    if (intervalIndex === null) {
      return 0;
    }
    const intervalMaximum = scoringIntervals.max(intervalIndex);
    const intervalMinimum = scoringIntervals.min(intervalIndex);
    const meshes = Array.from(CORE_MESH_CONFIGURATION.values());
    const intervalWeight = meshes[intervalIndex].weight;
    const intervalCoefficient = meshes[intervalIndex].coefficient;
    const progressionPercentage = 1 - (intervalMaximum - capacity) / (intervalMaximum - intervalMinimum);
    const score = Math.floor(intervalWeight * (intervalCoefficient + progressionPercentage));

    return Math.min(maximumReachableScore, score);
  }

  /**
   *  @param {object} params
   *  @param {number} params.capacity
   *  @returns {number|null} reachedMeshIndex
   */
  computeReachedMeshIndex({ capacity }) {
    const certificationScoringIntervals = this.v3CertificationScoring.intervals;
    const scoringIntervals = new Intervals({ intervals: certificationScoringIntervals });
    return scoringIntervals.findIntervalIndexFromCapacity(capacity);
  }

  /**
   *  @param {object} params
   *  @param {number} params.capacity
   *  @returns {CompetenceMark[]} competenceMarks
   */
  computeCompetenceMarks({ capacity }) {
    return this.v3CertificationScoring.getCompetencesScore(capacity);
  }
}
