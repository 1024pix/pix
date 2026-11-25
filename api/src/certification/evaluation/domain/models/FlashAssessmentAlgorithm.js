/**
 * @typedef {import('../../../shared/domain/models/FlashAssessmentAlgorithmConfiguration.js').FlashAssessmentAlgorithmConfiguration} FlashAssessmentAlgorithmConfiguration
 * @typedef {import('./CalibratedChallenge.js').CalibratedChallenge} CalibratedChallenge
 * @typedef {import('../../../../evaluation/domain/models/Answer.js').Answer} Answer
 * @typedef {import('../services/algorithm-methods/flash.js')} FlashAlgorithmImplementation
 */

import { AssessmentLackOfChallengesError } from '../../../../shared/domain/errors.js';
import { shouldStopEarly } from '../services/algorithm-methods/early-stop.js';
import { FlashAssessmentAlgorithmChallengesBetweenCompetencesRule } from './FlashAssessmentAlgorithmChallengesBetweenCompetencesRule.js';
import { FlashAssessmentAlgorithmNonAnsweredSkillsRule } from './FlashAssessmentAlgorithmNonAnsweredSkillsRule.js';
import { FlashAssessmentAlgorithmOneQuestionPerTubeRule } from './FlashAssessmentAlgorithmOneQuestionPerTubeRule.js';
import { FlashAssessmentAlgorithmPassageByAllCompetencesRule } from './FlashAssessmentAlgorithmPassageByAllCompetencesRule.js';
import { FlashAssessmentAlgorithmRuleEngine } from './FlashAssessmentAlgorithmRuleEngine.js';
import { FlashAssessmentAlgorithmSomeQuestionFromSkillListRule } from './FlashAssessmentAlgorithmSomeQuestionFromSkillListRule.js';

const availableRules = [
  FlashAssessmentAlgorithmOneQuestionPerTubeRule,
  FlashAssessmentAlgorithmNonAnsweredSkillsRule,
  FlashAssessmentAlgorithmPassageByAllCompetencesRule,
  FlashAssessmentAlgorithmChallengesBetweenCompetencesRule,
  FlashAssessmentAlgorithmSomeQuestionFromSkillListRule,
];

class FlashAssessmentAlgorithm {
  /**
   * @param {object} params
   * @param {FlashAlgorithmImplementation} params.flashAlgorithmImplementation
   * @param {FlashAssessmentAlgorithmConfiguration} params.configuration
   */
  constructor({ flashAlgorithmImplementation, configuration }) {
    /**
     * @private
     * @type {FlashAssessmentAlgorithmConfiguration}
     */
    this._configuration = configuration;
    this.flashAlgorithmImplementation = flashAlgorithmImplementation;

    this.ruleEngine = new FlashAssessmentAlgorithmRuleEngine(availableRules, {
      limitToOneQuestionPerTube: configuration.limitToOneQuestionPerTube,
      challengesBetweenSameCompetence: configuration.challengesBetweenSameCompetence,
      enablePassageByAllCompetences: configuration.enablePassageByAllCompetences,
      questionNumberToPickFromSkillList: configuration.questionNumberToPickFromSkillList,
    });
  }

  /**
   * @param {object} params
   * @param {Answer[]} params.assessmentAnswers
   * @param {CalibratedChallenge[]} params.challenges
   * @param {number} [params.initialCapacity]
   */
  getPossibleNextChallenges({ assessmentAnswers, challenges, initialCapacity, skills }) {
    const maximumAssessmentLength = this._configuration.maximumAssessmentLength;
    if (assessmentAnswers?.length > maximumAssessmentLength) {
      throw new RangeError('User answered more questions than allowed');
    }

    if (this.#hasAnsweredToAllChallenges({ assessmentAnswers, maximumAssessmentLength })) {
      return [];
    }

    const currentCapacity = initialCapacity ?? this._configuration.defaultCandidateCapacity;
    const { capacity, errorRate } = this.getCapacityAndErrorRate({
      allAnswers: assessmentAnswers,
      challenges,
      initialCapacity: currentCapacity,
    });

    if (this.#shouldStopEarly({ assessmentAnswers, capacity, errorRate })) {
      return [];
    }

    const challengesAfterRulesApplication = this.#applyChallengeSelectionRules(assessmentAnswers, challenges, skills);

    if (challengesAfterRulesApplication?.length === 0) {
      throw new AssessmentLackOfChallengesError({
        numberOfAnswers: assessmentAnswers?.length,
        maximumAssessmentLength,
      });
    }

    return this.flashAlgorithmImplementation.getPossibleNextChallenges({
      availableChallenges: challengesAfterRulesApplication,
      capacity,
    });
  }

  /**
   * @param {object} params
   * @param {Answer[]} params.assessmentAnswers
   * @param {number} params.maximumAssessmentLength
   */
  #hasAnsweredToAllChallenges({ assessmentAnswers, maximumAssessmentLength }) {
    if (assessmentAnswers && assessmentAnswers.length === maximumAssessmentLength) {
      return true;
    }

    return false;
  }

  /**
   * @param {object} params
   * @param {Answer[]} params.assessmentAnswers
   * @param {number} params.capacity
   * @param {number} params.errorRate
   */
  #shouldStopEarly({ assessmentAnswers, capacity, errorRate }) {
    if (!this._configuration.isEarlyStopEnabled || !assessmentAnswers) {
      return false;
    }

    return shouldStopEarly({
      answers: assessmentAnswers,
      capacity,
      errorRate,
      consecutiveFailures: this._configuration.earlyStopConsecutiveFailures,
      minimumLength: this._configuration.earlyStopMinimumLength,
      capacityThreshold: this._configuration.earlyStopCapacityThreshold,
      confidence: this._configuration.earlyStopConfidence,
    });
  }

  /**
   * @param {Answer[]} assessmentAnswers
   * @param {CalibratedChallenge[]} challenges
   */
  #applyChallengeSelectionRules(assessmentAnswers, challenges, skills) {
    return this.ruleEngine.execute({
      assessmentAnswers,
      allChallenges: challenges,
      skills,
    });
  }

  /**
   * @param {object} params
   * @param {Answer[]} params.allAnswers
   * @param {CalibratedChallenge[]} params.challenges
   * @param {number} [params.initialCapacity]
   */
  getCapacityAndErrorRate({ allAnswers, challenges, initialCapacity }) {
    const currentCapacity = initialCapacity ?? this._configuration.defaultCandidateCapacity;
    return this.flashAlgorithmImplementation.getCapacityAndErrorRate({
      allAnswers,
      challenges,
      capacity: currentCapacity,
      variationPercent: this._configuration.variationPercent,
    });
  }

  /**
   * @param {object} params
   * @param {Answer[]} params.allAnswers
   * @param {CalibratedChallenge[]} params.challenges
   * @param {number} [params.initialCapacity]
   */
  getCapacityAndErrorRateHistory({ allAnswers, challenges, initialCapacity }) {
    const currentCapacity = initialCapacity ?? this._configuration.defaultCandidateCapacity;
    return this.flashAlgorithmImplementation.getCapacityAndErrorRateHistory({
      allAnswers,
      challenges,
      capacity: currentCapacity,
      variationPercent: this._configuration.variationPercent,
    });
  }

  /**
   * @param {object} params
   * @param {number} params.capacity
   * @param {number} params.discriminant
   * @param {number} params.difficulty
   */
  getReward({ capacity, discriminant, difficulty }) {
    return this.flashAlgorithmImplementation.getReward({ capacity, discriminant, difficulty });
  }

  getConfiguration() {
    return this._configuration;
  }
}

export { FlashAssessmentAlgorithm };
