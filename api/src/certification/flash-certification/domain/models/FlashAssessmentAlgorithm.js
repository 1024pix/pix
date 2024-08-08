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
    const maximumAssessmentLength = this._configuration.maximumAssessmentLength;
    if (assessmentAnswers?.length > maximumAssessmentLength) {
      throw new AssessmentEndedError('User answered more questions than allowed');
    }

    if (this.#hasAnsweredToAllChallenges({ assessmentAnswers, maximumAssessmentLength })) {
      return [];
    }

    const { capacity } = this.getCapacityAndErrorRate({
      allAnswers: answersForComputingCapacity ?? assessmentAnswers,
      challenges,
      initialCapacity,
    });

    const challengesAfterRulesApplication = this.#applyChallengeSelectionRules(assessmentAnswers, challenges);

    if (challengesAfterRulesApplication?.length === 0) {
      throw new AssessmentEndedError('No eligible challenges in referential');
    }

    const minimalSuccessRate = this.#computeMinimalSuccessRate(assessmentAnswers.length);

    return this.flashAlgorithmImplementation.getPossibleNextChallenges({
      availableChallenges: challengesAfterRulesApplication,
      capacity,
      options: {
        challengesBetweenSameCompetence: this._configuration.challengesBetweenSameCompetence,
        minimalSuccessRate,
      },
    });
  }

  #hasAnsweredToAllChallenges({ assessmentAnswers, maximumAssessmentLength }) {
    if (assessmentAnswers && assessmentAnswers.length === maximumAssessmentLength) {
      return true;
    }

    return false;
  }

  #applyChallengeSelectionRules(assessmentAnswers, challenges) {
    return this.ruleEngine.execute({
      assessmentAnswers,
      allChallenges: challenges,
    });
  }

  #computeMinimalSuccessRate(questionIndex) {
    const filterConfiguration = this.#findApplicableSuccessRateConfiguration(questionIndex);

    if (!filterConfiguration) {
      return 0;
    }

    return filterConfiguration.getMinimalSuccessRate(questionIndex);
  }

  #findApplicableSuccessRateConfiguration(questionIndex) {
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
