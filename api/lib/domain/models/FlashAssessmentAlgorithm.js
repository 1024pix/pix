import { AssessmentEndedError } from '../errors.js';
import {
  getPossibleNextChallenges,
  getEstimatedLevelAndErrorRate,
  getReward,
} from '../services/algorithm-methods/flash.js';
import { config } from '../../config.js';
import { FlashAssessmentSuccessRateHandler } from './FlashAssessmentSuccessRateHandler.js';

const defaultMinimumEstimatedSuccessRateRanges = [
  // Between question 1 and question 8 included, we set the minimum estimated
  // success rate to 80%
  FlashAssessmentSuccessRateHandler.createFixed({
    startingChallengeIndex: 0,
    endingChallengeIndex: 7,
    value: 0.8,
  }),
  // Between question 9 and question 16 included, we linearly decrease the
  // minimum estimated success rate from 80% to 50%
  FlashAssessmentSuccessRateHandler.createLinear({
    startingChallengeIndex: 8,
    endingChallengeIndex: 15,
    startingValue: 0.8,
    endingValue: 0.5,
  }),
];

class FlashAssessmentAlgorithm {
  /**
   * Model to interact with the flash algorithm
   * @param warmUpLength - define a warmup when the algorithm do not go through the competences
   * @param forcedCompetences - force the algorithm to ask questions on the specified competences
   * @param maximumAssessmentLength - override the default limit for an assessment length
   * @param challengesBetweenSameCompetence - define a number of questions before getting another one on the same competence
   * @param minimumEstimatedSuccessRateRanges - force a minimal estimated success rate for challenges chosen at specific indexes
   * @param limitToOneQuestionPerTube - limits questions to one per tube
   */
  constructor({
    warmUpLength,
    forcedCompetences,
    maximumAssessmentLength,
    challengesBetweenSameCompetence = config.v3Certification.challengesBetweenSameCompetence,
    minimumEstimatedSuccessRateRanges = defaultMinimumEstimatedSuccessRateRanges,
    limitToOneQuestionPerTube = true,
  } = {}) {
    this.warmUpLength = warmUpLength;
    this.forcedCompetences = forcedCompetences;
    this.maximumAssessmentLength = maximumAssessmentLength || config.v3Certification.numberOfChallengesPerCourse;
    this.challengesBetweenSameCompetence = challengesBetweenSameCompetence;
    this.minimumEstimatedSuccessRateRanges = minimumEstimatedSuccessRateRanges;
    this.limitToOneQuestionPerTube = limitToOneQuestionPerTube;
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

    const minimalSuccessRate = this._computeMinimalSuccessRate(allAnswers.length);

    const { possibleChallenges, hasAssessmentEnded } = getPossibleNextChallenges({
      allAnswers,
      challenges,
      estimatedLevel,
      options: {
        warmUpLength: this.warmUpLength,
        forcedCompetences: this.forcedCompetences,
        challengesBetweenSameCompetence: this.challengesBetweenSameCompetence,
        minimalSuccessRate,
        limitToOneQuestionPerTube: this.limitToOneQuestionPerTube,
      },
    });

    if (hasAssessmentEnded) {
      throw new AssessmentEndedError();
    }

    return possibleChallenges;
  }

  _computeMinimalSuccessRate(questionIndex) {
    const filterConfiguration = this._findApplicableSuccessRateConfiguration(questionIndex);

    if (!filterConfiguration) {
      return 0;
    }

    return filterConfiguration.getMinimalSuccessRate(questionIndex);
  }

  _findApplicableSuccessRateConfiguration(questionIndex) {
    return this.minimumEstimatedSuccessRateRanges.find((successRateRange) =>
      successRateRange.isApplicable(questionIndex),
    );
  }

  getEstimatedLevelAndErrorRate({ allAnswers, challenges, initialCapacity }) {
    return getEstimatedLevelAndErrorRate({ allAnswers, challenges, estimatedLevel: initialCapacity });
  }

  getReward({ estimatedLevel, discriminant, difficulty }) {
    return getReward({ estimatedLevel, discriminant, difficulty });
  }
}

export { FlashAssessmentAlgorithm };
