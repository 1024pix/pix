import { config } from '../../../../shared/config.js';
import { AssessmentEndedError } from '../../../../shared/domain/errors.js';
import { FlashAssessmentAlgorithmChallengesBetweenCompetencesRule } from './FlashAssessmentAlgorithmChallengesBetweenCompetencesRule.js';
import { FlashAssessmentAlgorithmForcedCompetencesRule } from './FlashAssessmentAlgorithmForcedCompetencesRule.js';
import { FlashAssessmentAlgorithmNonAnsweredSkillsRule } from './FlashAssessmentAlgorithmNonAnsweredSkillsRule.js';
import { FlashAssessmentAlgorithmOneQuestionPerTubeRule } from './FlashAssessmentAlgorithmOneQuestionPerTubeRule.js';
import { FlashAssessmentAlgorithmPassageByAllCompetencesRule } from './FlashAssessmentAlgorithmPassageByAllCompetencesRule.js';
import { FlashAssessmentAlgorithmRuleEngine } from './FlashAssessmentAlgorithmRuleEngine.js';

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
    this._configuration = configuration;
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
    answersForComputingCapacity,
  }) {
    if (assessmentAnswers.length >= this._configuration.maximumAssessmentLength) {
      throw new AssessmentEndedError();
    }

    const { capacity } = this.getCapacityAndErrorRate({
      allAnswers: answersForComputingCapacity ?? assessmentAnswers,
      challenges,
      initialCapacity,
    });

    const challengesAfterRulesApplication = this._applyChallengeSelectionRules(assessmentAnswers, challenges);

    if (challengesAfterRulesApplication?.length === 0) {
      throw new AssessmentEndedError();
    }

    const minimalSuccessRate = this._computeMinimalSuccessRate(assessmentAnswers.length);

    return this.flashAlgorithmImplementation.getPossibleNextChallenges({
      availableChallenges: challengesAfterRulesApplication,
      capacity,
      options: {
        challengesBetweenSameCompetence: this._configuration.challengesBetweenSameCompetence,
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
    return this._configuration.minimumEstimatedSuccessRateRanges.find((successRateRange) =>
      successRateRange.isApplicable(questionIndex),
    );
  }

  getCapacityAndErrorRate({
    allAnswers,
    challenges,
    initialCapacity = config.v3Certification.defaultCandidateCapacity,
  }) {
    return this.flashAlgorithmImplementation.getCapacityAndErrorRate({
      allAnswers,
      challenges,
      capacity: initialCapacity,
      variationPercent: this._configuration.variationPercent,
      variationPercentUntil: this._configuration.variationPercentUntil,
      doubleMeasuresUntil: this._configuration.doubleMeasuresUntil,
    });
  }

  getCapacityAndErrorRateHistory({
    allAnswers,
    challenges,
    initialCapacity = config.v3Certification.defaultCandidateCapacity,
  }) {
    return this.flashAlgorithmImplementation.getCapacityAndErrorRateHistory({
      allAnswers,
      challenges,
      capacity: initialCapacity,
      variationPercent: this._configuration.variationPercent,
      variationPercentUntil: this._configuration.variationPercentUntil,
      doubleMeasuresUntil: this._configuration.doubleMeasuresUntil,
    });
  }

  getReward({ capacity, discriminant, difficulty }) {
    return this.flashAlgorithmImplementation.getReward({ capacity, discriminant, difficulty });
  }

  getConfiguration() {
    return this._configuration;
  }
}

export { FlashAssessmentAlgorithm };
