import { CertificationChallengeCapacity } from './CertificationChallengeCapacity.js';

export class CertificationAssessmentHistory {
  constructor({ capacityHistory }) {
    this.capacityHistory = capacityHistory;
  }
  static fromChallengesAndAnswers({ algorithm, challenges, allAnswers }) {
    const estimatedLevelAndErrorRateHistory = algorithm.getEstimatedLevelAndErrorRateHistory({
      allAnswers,
      challenges,
    });

    const capacityHistory = estimatedLevelAndErrorRateHistory.map(({ answerId, capacity }, index) =>
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
