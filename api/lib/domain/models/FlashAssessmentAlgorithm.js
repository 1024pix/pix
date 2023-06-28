import { AssessmentEndedError } from '../../../src/shared/domain/errors.js';
import {
  getPossibleNextChallenges,
  getEstimatedLevelAndErrorRate,
  getReward,
} from '../services/algorithm-methods/flash.js';
import { MAX_NEXT_GEN_CERTIFICATION_CHALLENGES } from '../constants.js';

class FlashAssessmentAlgorithm {
  constructor({ warmUpLength, forcedCompetences, maximumAssessmentLength } = {}) {
    this.warmUpLength = warmUpLength;
    this.forcedCompetences = forcedCompetences;
    this.maximumAssessmentLength = maximumAssessmentLength || MAX_NEXT_GEN_CERTIFICATION_CHALLENGES;
  }

  getPossibleNextChallenges({ allAnswers, challenges, estimatedLevel }) {
    if (allAnswers.length >= this.maximumAssessmentLength) {
      throw new AssessmentEndedError();
    }

    const { possibleChallenges, hasAssessmentEnded } = getPossibleNextChallenges({
      allAnswers,
      challenges,
      estimatedLevel,
      warmUpLength: this.warmUpLength,
      forcedCompetences: this.forcedCompetences,
    });

    if (hasAssessmentEnded) {
      throw new AssessmentEndedError();
    }

    return possibleChallenges;
  }

  getEstimatedLevelAndErrorRate({ allAnswers, challenges }) {
    return getEstimatedLevelAndErrorRate({ allAnswers, challenges });
  }

  getReward({ estimatedLevel, discriminant, difficulty }) {
    return getReward({ estimatedLevel, discriminant, difficulty });
  }
}

export { FlashAssessmentAlgorithm };
