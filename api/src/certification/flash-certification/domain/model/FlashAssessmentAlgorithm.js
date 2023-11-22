import { FlashAssessmentAlgorithmRuleEngine } from './FlashAssessmentAlgorithmRuleEngine.js';
import { FlashAssessmentAlgorithmOneQuestionPerTubeRule } from './FlashAssessmentAlgorithmOneQuestionPerTubeRule.js';
import { FlashAssessmentAlgorithmNonAnsweredSkillsRule } from './FlashAssessmentAlgorithmNonAnsweredSkillsRule.js';
import { FlashAssessmentAlgorithmPassageByAllCompetencesRule } from './FlashAssessmentAlgorithmPassageByAllCompetencesRule.js';
import { FlashAssessmentAlgorithmForcedCompetencesRule } from './FlashAssessmentAlgorithmForcedCompetencesRule.js';
import { FlashAssessmentAlgorithmChallengesBetweenCompetencesRule } from './FlashAssessmentAlgorithmChallengesBetweenCompetencesRule.js';
import { AssessmentEndedError } from '../../../../shared/domain/errors.js';
import { config } from '../../../../shared/config.js';

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
   * @param configuration - options to configure algorithm challenge selection and behaviour
   */
  constructor({ flashAlgorithmImplementation, configuration = {} } = {}) {
    this.configuration = configuration;
    this.flashAlgorithmImplementation = flashAlgorithmImplementation;

    this.ruleEngine = new FlashAssessmentAlgorithmRuleEngine(availableRules, {
      limitToOneQuestionPerTube: configuration.limitToOneQuestionPerTube,
      challengesBetweenSameCompetence: configuration.challengesBetweenSameCompetence,
      forcedCompetences: configuration.forcedCompetences,
      warmUpLength: configuration.warmUpLength,
      enablePassageByAllCompetences: configuration.enablePassageByAllCompetences,
    });
  }

  getPossibleNextChallenges({
    assessmentAnswers,
    challenges,
    initialCapacity = config.v3Certification.defaultCandidateCapacity,
    answersForComputingEstimatedLevel,
  }) {
    if (assessmentAnswers.length >= this.configuration.maximumAssessmentLength) {
      throw new AssessmentEndedError();
    }

    const { estimatedLevel } = this.getEstimatedLevelAndErrorRate({
      allAnswers: answersForComputingEstimatedLevel ?? assessmentAnswers,
      challenges,
      initialCapacity,
      variationPercent: this.configuration.variationPercent,
    });

    const challengesAfterRulesApplication = this._applyChallengeSelectionRules(assessmentAnswers, challenges);

    if (challengesAfterRulesApplication?.length === 0) {
      throw new AssessmentEndedError();
    }

    const minimalSuccessRate = this._computeMinimalSuccessRate(assessmentAnswers.length);

    return this.flashAlgorithmImplementation.getPossibleNextChallenges({
      availableChallenges: challengesAfterRulesApplication,
      estimatedLevel,
      options: {
        challengesBetweenSameCompetence: this.configuration.challengesBetweenSameCompetence,
        minimalSuccessRate,
      },
    });
  }

  _applyChallengeSelectionRules(assessmentAnswers, challenges) {
    return this.ruleEngine.execute({
      assessmentAnswers,
      allChallenges: challenges,
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
    return this.configuration.minimumEstimatedSuccessRateRanges.find((successRateRange) =>
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
      variationPercent: this.configuration.variationPercent,
      doubleMeasuresUntil: this.configuration.doubleMeasuresUntil,
    });
  }

  getReward({ estimatedLevel, discriminant, difficulty }) {
    return this.flashAlgorithmImplementation.getReward({ estimatedLevel, discriminant, difficulty });
  }
}

export { FlashAssessmentAlgorithm };
