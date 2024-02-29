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

    const capacityHistory = estimatedLevelAndErrorRateHistory.map(({ estimatedLevel }, index) =>
      CertificationChallengeCapacity.create({
        certificationChallengeId: challenges[index].certificationChallengeId,
        capacity: estimatedLevel,
      }),
    );

    return new CertificationAssessmentHistory({
      capacityHistory,
    });
  }
}
