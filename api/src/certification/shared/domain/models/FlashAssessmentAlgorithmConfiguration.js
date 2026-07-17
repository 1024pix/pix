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
   */
  constructor({
    maximumAssessmentLength,
    challengesBetweenSameCompetence,
    limitToOneQuestionPerTube,
    enablePassageByAllCompetences,
    variationPercent,
    defaultCandidateCapacity,
    defaultProbabilityToPickChallenge,
  } = {}) {
    this.maximumAssessmentLength = maximumAssessmentLength;
    this.challengesBetweenSameCompetence = challengesBetweenSameCompetence;
    this.limitToOneQuestionPerTube = limitToOneQuestionPerTube;
    this.enablePassageByAllCompetences = enablePassageByAllCompetences;
    this.variationPercent = variationPercent;
    this.defaultCandidateCapacity = defaultCandidateCapacity;
    this.defaultProbabilityToPickChallenge = defaultProbabilityToPickChallenge;
    this.#validate();
  }

  #validate() {
    const { error } = FlashAssessmentAlgorithmConfiguration.#schema.validate(this, { allowUnknown: false });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}
