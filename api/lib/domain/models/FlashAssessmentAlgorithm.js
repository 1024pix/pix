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
    this.difficultyProgressionReduction = {
      frozenMinimumSuccessRate: 0.8,
      difficultyFreezeLength: 8,
      targetMinimumSuccessRate: 0.5,
      difficultyProgressionLength: 8,
    };
  }

  getPossibleNextChallenges({ allAnswers, challenges, initialCapacity }) {
    if (allAnswers.length >= this.maximumAssessmentLength) {
      throw new AssessmentEndedError();
    }

    const { estimatedLevel } = this.getEstimatedLevelAndErrorRate({
      allAnswers,
      challenges,
      initialCapacity,
    });

    const minimalSuccessRate = this._computeMinimalSuccessRate(allAnswers.length);

    const { possibleChallenges, hasAssessmentEnded } = getPossibleNextChallenges({
      allAnswers,
      challenges,
      estimatedLevel,
      warmUpLength: this.warmUpLength,
      forcedCompetences: this.forcedCompetences,
      minimalSuccessRate,
    });

    if (hasAssessmentEnded) {
      throw new AssessmentEndedError();
    }

    return possibleChallenges;
  }

  _computeMinimalSuccessRate(questionIndex) {
    const { difficultyFreezeLength, frozenMinimumSuccessRate, difficultyProgressionLength, targetMinimumSuccessRate } =
      this.difficultyProgressionReduction;
    if (questionIndex < difficultyFreezeLength) {
      return frozenMinimumSuccessRate;
    }
    if (
      questionIndex >= difficultyFreezeLength &&
      questionIndex < difficultyFreezeLength + difficultyProgressionLength
    ) {
      return (
        frozenMinimumSuccessRate +
        (targetMinimumSuccessRate - frozenMinimumSuccessRate) /
          (difficultyProgressionLength + difficultyFreezeLength - questionIndex)
      );
    }

    return 0;
  }

  getEstimatedLevelAndErrorRate({ allAnswers, challenges, initialCapacity }) {
    return getEstimatedLevelAndErrorRate({ allAnswers, challenges, estimatedLevel: initialCapacity });
  }

  getReward({ estimatedLevel, discriminant, difficulty }) {
    return getReward({ estimatedLevel, discriminant, difficulty });
  }
}

export { FlashAssessmentAlgorithm };
