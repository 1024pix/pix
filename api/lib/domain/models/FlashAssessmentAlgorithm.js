import { AssessmentEndedError } from '../errors.js';
import {
  getPossibleNextChallenges,
  getEstimatedLevelAndErrorRate,
  getReward,
} from '../services/algorithm-methods/flash.js';
import { config } from '../../config.js';

class FlashAssessmentAlgorithm {
  constructor({ warmUpLength, forcedCompetences, maximumAssessmentLength } = {}) {
    this.warmUpLength = warmUpLength;
    this.forcedCompetences = forcedCompetences;
    this.maximumAssessmentLength = maximumAssessmentLength || config.v3Certification.numberOfChallengesPerCourse;
  }

  getPossibleNextChallenges({ allAnswers, challenges }) {
    if (allAnswers.length >= this.maximumAssessmentLength) {
      throw new AssessmentEndedError();
    }

    const { estimatedLevel } = this.getEstimatedLevelAndErrorRate({
      allAnswers,
      challenges,
    });

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
