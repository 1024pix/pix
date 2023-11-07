import { FlashAssessmentAlgorithmRuleEngine } from './FlashAssessmentAlgorithmRuleEngine.js';
import { FlashAssessmentAlgorithmOneQuestionPerTubeRule } from './FlashAssessmentAlgorithmOneQuestionPerTubeRule.js';
import { FlashAssessmentAlgorithmNonAnsweredSkillsRule } from './FlashAssessmentAlgorithmNonAnsweredSkillsRule.js';
import { FlashAssessmentAlgorithmPassageByAllCompetencesRule } from './FlashAssessmentAlgorithmPassageByAllCompetencesRule.js';
import { FlashAssessmentAlgorithmForcedCompetencesRule } from './FlashAssessmentAlgorithmForcedCompetencesRule.js';
import { FlashAssessmentAlgorithmChallengesBetweenCompetencesRule } from './FlashAssessmentAlgorithmChallengesBetweenCompetencesRule.js';
import { FlashAssessmentSuccessRateHandler } from './FlashAssessmentSuccessRateHandler.js';
import { AssessmentEndedError } from '../../../../shared/domain/errors.js';
import { config } from '../../../../shared/config.js';

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

const availableRules = [
  FlashAssessmentAlgorithmOneQuestionPerTubeRule,
  FlashAssessmentAlgorithmNonAnsweredSkillsRule,
  FlashAssessmentAlgorithmPassageByAllCompetencesRule,
  FlashAssessmentAlgorithmForcedCompetencesRule,
  FlashAssessmentAlgorithmChallengesBetweenCompetencesRule,
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
   * @param flashImplementation - the flash algorithm implementation
   * @param enablePassageByAllCompetences - enable or disable the passage through all competences
   */
  constructor({
    warmUpLength,
    forcedCompetences,
    maximumAssessmentLength,
    challengesBetweenSameCompetence = config.v3Certification.challengesBetweenSameCompetence,
    minimumEstimatedSuccessRateRanges = defaultMinimumEstimatedSuccessRateRanges,
    limitToOneQuestionPerTube,
    flashAlgorithmImplementation,
    enablePassageByAllCompetences,
    variationPercent,
  } = {}) {
    this.maximumAssessmentLength = maximumAssessmentLength || config.v3Certification.numberOfChallengesPerCourse;
    this.challengesBetweenSameCompetence = challengesBetweenSameCompetence;
    this.minimumEstimatedSuccessRateRanges = minimumEstimatedSuccessRateRanges;
    this.limitToOneQuestionPerTube = limitToOneQuestionPerTube;
    this.flashAlgorithmImplementation = flashAlgorithmImplementation;
    this.variationPercent = variationPercent;

    this.ruleEngine = new FlashAssessmentAlgorithmRuleEngine(availableRules, {
      limitToOneQuestionPerTube,
      challengesBetweenSameCompetence,
      forcedCompetences,
      warmUpLength,
      enablePassageByAllCompetences,
    });
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
      variationPercent: this.variationPercent,
    });

    const minimalSuccessRate = this._computeMinimalSuccessRate(allAnswers.length);

    const challengesAfterRulesApplication = this.ruleEngine.execute({
      allAnswers,
      allChallenges: challenges,
    });

    if (
      challengesAfterRulesApplication?.length === 0 ||
      allAnswers.length >= config.features.numberOfChallengesForFlashMethod
    ) {
      throw new AssessmentEndedError();
    }

    return this.flashAlgorithmImplementation.getPossibleNextChallenges({
      availableChallenges: challengesAfterRulesApplication,
      estimatedLevel,
      options: {
        challengesBetweenSameCompetence: this.challengesBetweenSameCompetence,
        minimalSuccessRate,
      },
    });
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

  getEstimatedLevelAndErrorRate({
    allAnswers,
    challenges,
    initialCapacity = config.v3Certification.defaultCandidateCapacity,
  }) {
    return this.flashAlgorithmImplementation.getEstimatedLevelAndErrorRate({
      allAnswers,
      challenges,
      estimatedLevel: initialCapacity,
      variationPercent: this.variationPercent,
    });
  }

  getReward({ estimatedLevel, discriminant, difficulty }) {
    return this.flashAlgorithmImplementation.getReward({ estimatedLevel, discriminant, difficulty });
  }
}

export { FlashAssessmentAlgorithm };
