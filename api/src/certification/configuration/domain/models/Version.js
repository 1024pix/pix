import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { SCOPES } from '../../../shared/domain/models/Scopes.js';

export class Version {
  static #schema = Joi.object({
    id: Joi.number().optional(),
    scope: Joi.string()
      .required()
      .valid(...Object.values(SCOPES)),
    startDate: Joi.date().required(),
    expirationDate: Joi.date().allow(null).optional(),
    assessmentDuration: Joi.number().required(),
    globalScoringConfiguration: Joi.array().allow(null).optional(),
    competencesScoringConfiguration: Joi.array().allow(null).optional(),
    challengesConfiguration: Joi.object().instance(FlashAssessmentAlgorithmConfiguration).required(),
  });

  /**
   * @param {object} params
   * @param {number} [params.id] - version identifier (optional for new versions)
   * @param {Scopes} params.scope - Certification scope (CORE, DROIT, etc.)
   * @param {Date} params.startDate - When this version becomes active
   * @param {Date|null} [params.expirationDate] - When this version expires (null if current)
   * @param {number} params.assessmentDuration - Assessment duration in minutes
   * @param {Array<object>} [params.globalScoringConfiguration] - Global scoring configuration
   * @param {Array<object>} [params.competencesScoringConfiguration] - Competences scoring configuration
   * @param {FlashAssessmentAlgorithmConfiguration} params.challengesConfiguration - Challenges configuration
   */
  constructor({
    id,
    scope,
    startDate,
    expirationDate,
    assessmentDuration,
    globalScoringConfiguration,
    competencesScoringConfiguration,
    challengesConfiguration,
  }) {
    this.id = id;
    this.scope = scope;
    this.startDate = startDate;
    this.expirationDate = expirationDate;
    this.assessmentDuration = assessmentDuration;
    this.globalScoringConfiguration = globalScoringConfiguration;
    this.competencesScoringConfiguration = competencesScoringConfiguration;
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
