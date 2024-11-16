/**
 * @typedef {import('../../../flash-certification/domain/models/FlashAssessmentAlgorithm.js').FlashAssessmentAlgorithm} FlashAssessmentAlgorithm
 * @typedef {import('./CertificationChallengeForScoring.js').CertificationChallengeForScoring} CertificationChallengeForScoring
 * @typedef {import('../../../../evaluation/domain/models/Answer.js').Answer} Answer
 */
import { CertificationChallengeCapacity } from './CertificationChallengeCapacity.js';

export class CertificationAssessmentHistory {
  constructor({ capacityHistory }) {
    this.capacityHistory = capacityHistory;
  }
  /**
   * @param {Object} params
   * @param {FlashAssessmentAlgorithm } params.algorithm
   * @param {Array<CertificationChallengeForScoring>} params.challenges
   * @param {Array<Answer>} params.allAnswers
   **/
  static fromChallengesAndAnswers({ algorithm, challenges, allAnswers }) {
    const capacityAndErrorRateHistory = algorithm.getCapacityAndErrorRateHistory({
      allAnswers,
      challenges,
    });

    const capacityHistory = capacityAndErrorRateHistory.map(({ answerId, capacity }, index) =>
      CertificationChallengeCapacity.create({
        answerId,
        certificationChallengeId: challenges[index].certificationChallengeId,
        capacity,
      }),
    );

    return new CertificationAssessmentHistory({
      capacityHistory,
    });
  }
}
