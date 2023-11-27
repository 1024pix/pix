import { config } from '../../../../shared/config.js';
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

/**
 * @param forcedCompetences - force the algorithm to ask questions on the specified competences
 * @param maximumAssessmentLength - override the default limit for an assessment length
 * @param challengesBetweenSameCompetence - define a number of questions before getting another one on the same competence
 * @param minimumEstimatedSuccessRateRanges - force a minimal estimated success rate for challenges chosen at specific indexes
 * @param limitToOneQuestionPerTube - limits questions to one per tube
 * @param flashImplementation - the flash algorithm implementation
 * @param enablePassageByAllCompetences - enable or disable the passage through all competences
 * @param variationPercent - maximum variation of estimated level between two answers
 * @param doubleMeasuresUntil - use the double measure strategy for specified number of challenges
 */
export class FlashAssessmentAlgorithmConfiguration {
  constructor({
    warmUpLength,
    forcedCompetences,
    maximumAssessmentLength = config.v3Certification.numberOfChallengesPerCourse,
    challengesBetweenSameCompetence = config.v3Certification.challengesBetweenSameCompetence,
    minimumEstimatedSuccessRateRanges = defaultMinimumEstimatedSuccessRateRanges,
    limitToOneQuestionPerTube,
    enablePassageByAllCompetences,
    variationPercent,
    doubleMeasuresUntil,
  } = {}) {
    this.warmUpLength = warmUpLength;
    this.forcedCompetences = forcedCompetences;
    this.maximumAssessmentLength = maximumAssessmentLength;
    this.challengesBetweenSameCompetence = challengesBetweenSameCompetence;
    this.minimumEstimatedSuccessRateRanges = minimumEstimatedSuccessRateRanges;
    this.limitToOneQuestionPerTube = limitToOneQuestionPerTube;
    this.enablePassageByAllCompetences = enablePassageByAllCompetences;
    this.variationPercent = variationPercent;
    this.doubleMeasuresUntil = doubleMeasuresUntil;
  }

  toDTO() {
    return {
      warmUpLength: this.warmUpLength,
      forcedCompetences: JSON.stringify(this.forcedCompetences),
      maximumAssessmentLength: this.maximumAssessmentLength,
      challengesBetweenSameCompetence: this.challengesBetweenSameCompetence,
      minimumEstimatedSuccessRateRanges: JSON.stringify(
        this.minimumEstimatedSuccessRateRanges.map((successRateRange) => successRateRange.toDTO()),
      ),
      limitToOneQuestionPerTube: this.limitToOneQuestionPerTube,
      enablePassageByAllCompetences: this.enablePassageByAllCompetences,
      variationPercent: this.variationPercent,
      doubleMeasuresUntil: this.doubleMeasuresUntil,
    };
  }

  static fromDTO({
    warmUpLength,
    forcedCompetences,
    maximumAssessmentLength,
    challengesBetweenSameCompetence,
    minimumEstimatedSuccessRateRanges,
    limitToOneQuestionPerTube,
    enablePassageByAllCompetences,
    variationPercent,
    doubleMeasuresUntil,
  }) {
    return new FlashAssessmentAlgorithmConfiguration({
      warmUpLength,
      forcedCompetences,
      maximumAssessmentLength,
      challengesBetweenSameCompetence,
      minimumEstimatedSuccessRateRanges: minimumEstimatedSuccessRateRanges
        ? minimumEstimatedSuccessRateRanges.map((config) => FlashAssessmentSuccessRateHandler.fromDTO(config))
        : minimumEstimatedSuccessRateRanges,
      limitToOneQuestionPerTube,
      enablePassageByAllCompetences,
      variationPercent,
      doubleMeasuresUntil,
    });
  }
}
