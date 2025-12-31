import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { SCOPES } from './Scopes.js';

export class Version {
  static #schema = Joi.object({
    id: Joi.number().required(),
    scope: Joi.string()
      .required()
      .valid(...Object.values(SCOPES)),
    challengesConfiguration: Joi.object()
      .keys({
        maximumAssessmentLength: Joi.number().integer().min(0).required(),
        challengesBetweenSameCompetence: Joi.number().integer().min(0).required(),
        defaultCandidateCapacity: Joi.number().required(),
        defaultProbabilityToPickChallenge: Joi.number().min(0).max(100).required(),
      })
      .unknown(true)
      .required(),
  });

  /**
   * @param {object} params
   * @param {number} params.id - version identifier
   * @param {SCOPES} params.scope - Certification scope (CORE, DROIT, etc.)
   * @param {object} params.challengesConfiguration - Challenges configuration
   * @param {number} params.challengesConfiguration.maximumAssessmentLength - limit for assessment length
   * @param {number} params.challengesConfiguration.challengesBetweenSameCompetence - define a number of questions before getting another one on the same competence
   * @param {number} params.challengesConfiguration.defaultCandidateCapacity - capacity when none has been yet determined
   * @param {number} params.challengesConfiguration.defaultProbabilityToPickChallenge - The probability (as a percentage, 0-100) that the ramdomizing function will pick a challenge from a list of possible challenges.
   */
  constructor({ id, scope, challengesConfiguration }) {
    this.id = id;
    this.scope = scope;
    this.challengesConfiguration = challengesConfiguration;
    this.#validate();
  }

  #validate() {
    const { error } = Version.#schema.validate(this, { allowUnknown: false });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}
