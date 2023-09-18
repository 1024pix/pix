import { AssessmentEndedError } from '../errors.js';
import {
  getPossibleNextChallenges,
  getEstimatedLevelAndErrorRate,
  getReward,
} from '../services/algorithm-methods/flash.js';
import { config } from '../../config.js';

class FlashAssessmentAlgorithm {
  /**
   * Model to interact with the flash algorithm
   * @param warmUpLength - define a warmup when the algorithm do not go through the competences
   * @param forcedCompetences - force the algorithm to ask questions on the specified competences
   * @param maximumAssessmentLength - override the default limit for an assessment length
   * @param challengesBetweenSameCompetence - define a number of questions between the same competence
   */
  constructor({ warmUpLength, forcedCompetences, maximumAssessmentLength, challengesBetweenSameCompetence } = {}) {
    this.warmUpLength = warmUpLength;
    this.forcedCompetences = forcedCompetences;
    this.maximumAssessmentLength = maximumAssessmentLength || config.v3Certification.numberOfChallengesPerCourse;
    this.challengesBetweenSameCompetence = challengesBetweenSameCompetence;
  }

  getPossibleNextChallenges({
    allAnswers,
    challenges,
    initialCapacity = config.v3Certification.defaultCandidateCapacity,
  }) {
    if (allAnswers.length >= this.maximumAssessmentLength) {
      throw new AssessmentEndedError();
    }

    const { estimatedLevel } = this.getEstimatedLevelAndErrorRate({
      allAnswers,
      challenges,
      initialCapacity,
    });

    const { possibleChallenges, hasAssessmentEnded } = getPossibleNextChallenges({
      allAnswers,
      challenges,
      estimatedLevel,
      options: {
        warmUpLength: this.warmUpLength,
        forcedCompetences: this.forcedCompetences,
        challengesBetweenSameCompetence: this.challengesBetweenSameCompetence,
      },
    });

    if (hasAssessmentEnded) {
      throw new AssessmentEndedError();
    }

    return possibleChallenges;
  }

  getEstimatedLevelAndErrorRate({ allAnswers, challenges, initialCapacity }) {
    return getEstimatedLevelAndErrorRate({ allAnswers, challenges, estimatedLevel: initialCapacity });
  }

  getReward({ estimatedLevel, discriminant, difficulty }) {
    return getReward({ estimatedLevel, discriminant, difficulty });
  }
}

export { FlashAssessmentAlgorithm };
