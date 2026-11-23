import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';

export class FlashAssessmentAlgorithmConfiguration {
  static #schema = Joi.object({
    maximumAssessmentLength: Joi.number().integer().min(0).required(),
    challengesBetweenSameCompetence: Joi.number().integer().min(0).required(),
    limitToOneQuestionPerTube: Joi.boolean().required(),
    enablePassageByAllCompetences: Joi.boolean().required(),
    variationPercent: Joi.number().min(0).max(1).required(),
    defaultCandidateCapacity: Joi.number().required(),
    defaultProbabilityToPickChallenge: Joi.number().min(0).max(100).required(),
    earlyStopConsecutiveFailures: Joi.number().integer().min(1).allow(null),
    earlyStopMinimumLength: Joi.number()
      .integer()
      .min(0)
      .allow(null)
      .when('earlyStopConsecutiveFailures', {
        is: Joi.number().required(),
        then: Joi.required().invalid(null),
      }),
    earlyStopCapacityThreshold: Joi.number()
      .allow(null)
      .when('earlyStopConsecutiveFailures', {
        is: Joi.number().required(),
        then: Joi.required().invalid(null),
      }),
    earlyStopConfidence: Joi.number()
      .greater(0)
      .less(1)
      .allow(null)
      .when('earlyStopConsecutiveFailures', {
        is: Joi.number().required(),
        then: Joi.required().invalid(null),
      }),
    questionNumberToPickFromSkillList: Joi.array().items(Joi.number().integer().min(1)),
  });

  /**
   * @param {object} props
   * @param {number} props.maximumAssessmentLength - limit for assessment length
   * @param {number} props.challengesBetweenSameCompetence - define a number of questions before getting another one on the same competence
   * @param {boolean} props.limitToOneQuestionPerTube - limits questions to one per tube
   * @param {boolean} props.enablePassageByAllCompetences - enable or disable the passage through all competences
   * @param {number} props.variationPercent
   * @param {number} props.defaultCandidateCapacity - starting candidate capacity for first challenge
   * @param {number} props.defaultProbabilityToPickChallenge - The probability (as a percentage, 0-100) that the ramdomizing function will pick a challenge from a list of possible challenges.
   * @param {number|null} [props.earlyStopConsecutiveFailures] - early stop (R4): number of consecutive failures triggering the stop, null disables it
   * @param {number|null} [props.earlyStopMinimumLength] - early stop (R4): minimum number of answers before the rule applies
   * @param {number|null} [props.earlyStopCapacityThreshold] - early stop (R4): capacity threshold
   * @param {number|null} [props.earlyStopConfidence] - early stop (R4): minimum probability for the capacity to be below the threshold
   * @param {number} props.questionNumberToPickFromSkillList - specify the number of each question that should be picked from a skill list.
   */

  constructor({
    maximumAssessmentLength,
    challengesBetweenSameCompetence,
    limitToOneQuestionPerTube,
    enablePassageByAllCompetences,
    variationPercent,
    defaultCandidateCapacity,
    defaultProbabilityToPickChallenge,
    earlyStopConsecutiveFailures = null,
    earlyStopMinimumLength = null,
    earlyStopCapacityThreshold = null,
    earlyStopConfidence = null,
    questionNumberToPickFromSkillList,
  } = {}) {
    this.maximumAssessmentLength = maximumAssessmentLength;
    this.challengesBetweenSameCompetence = challengesBetweenSameCompetence;
    this.limitToOneQuestionPerTube = limitToOneQuestionPerTube;
    this.enablePassageByAllCompetences = enablePassageByAllCompetences;
    this.variationPercent = variationPercent;
    this.defaultCandidateCapacity = defaultCandidateCapacity;
    this.defaultProbabilityToPickChallenge = defaultProbabilityToPickChallenge;
    this.earlyStopConsecutiveFailures = earlyStopConsecutiveFailures;
    this.earlyStopMinimumLength = earlyStopMinimumLength;
    this.earlyStopCapacityThreshold = earlyStopCapacityThreshold;
    this.earlyStopConfidence = earlyStopConfidence;
    this.questionNumberToPickFromSkillList = questionNumberToPickFromSkillList;
    this.#validate();
  }

  get isEarlyStopEnabled() {
    return this.earlyStopConsecutiveFailures !== null;
  }

  #validate() {
    const { error } = FlashAssessmentAlgorithmConfiguration.#schema.validate(this, { allowUnknown: false });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}
