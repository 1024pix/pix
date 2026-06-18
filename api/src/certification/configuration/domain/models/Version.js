import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import {
  DEFAULT_MINIMUM_ANSWERS_REQUIRED_TO_VALIDATE_A_CERTIFICATION,
  DEFAULT_PROBABILITY_TO_PICK_CHALLENGE,
  DEFAULT_SESSION_DURATION_MINUTES,
} from '../../../shared/domain/constants.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { SCOPES } from '../../../shared/domain/models/Scopes.js';
import { FRAMEWORK_HISTORY_STATUSES } from '../read-models/FrameworkHistoryEntry.js';

export class Version {
  static #schema = Joi.object({
    id: Joi.number().allow(null).optional(),
    scope: Joi.string()
      .required()
      .valid(...Object.values(SCOPES)),
    startDate: Joi.date().allow(null).optional(),
    expirationDate: Joi.date().allow(null).optional(),
    assessmentDuration: Joi.number().required(),
    minimumAnswersRequiredToValidateACertification: Joi.number().required(),
    globalScoringConfiguration: Joi.array().allow(null).optional(),
    competencesScoringConfiguration: Joi.array().allow(null).optional(),
    challengesConfiguration: Joi.object().instance(FlashAssessmentAlgorithmConfiguration).required(),
    comments: Joi.string().allow(null).optional(),
    status: Joi.string()
      .required()
      .valid(...Object.values(FRAMEWORK_HISTORY_STATUSES)),
  });

  /**
   * @param {object} params
   * @param {number} [params.id] - version identifier (optional for new versions)
   * @param {SCOPES} params.scope - Certification scope (CORE, DROIT, etc.)
   * @param {Date} params.startDate - When this version becomes active
   * @param {Date|null} [params.expirationDate] - When this version expires (null if current)
   * @param {number} params.assessmentDuration - Assessment duration in minutes
   * @param {number} params.minimumAnswersRequiredToValidateACertification
   * @param {string} params.comments
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
    minimumAnswersRequiredToValidateACertification,
    globalScoringConfiguration,
    competencesScoringConfiguration,
    challengesConfiguration,
    comments,
  }) {
    this.id = id;
    this.scope = scope;
    this.startDate = startDate;
    this.expirationDate = expirationDate;
    this.assessmentDuration = assessmentDuration;
    this.minimumAnswersRequiredToValidateACertification = minimumAnswersRequiredToValidateACertification;
    this.globalScoringConfiguration = globalScoringConfiguration;
    this.competencesScoringConfiguration = competencesScoringConfiguration;
    this.challengesConfiguration = challengesConfiguration;
    this.comments = comments === '' ? null : comments;
    this.status = this.#computeStatus();
    this.#validate();
  }

  #computeStatus() {
    if (this.expirationDate) return FRAMEWORK_HISTORY_STATUSES.ARCHIVED;
    if (this.startDate) return FRAMEWORK_HISTORY_STATUSES.ACTIVE;
    return FRAMEWORK_HISTORY_STATUSES.DRAFT;
  }

  #validate() {
    const { error } = Version.#schema.validate(this, { allowUnknown: false });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }

  update({ comments }) {
    this.comments = comments;
  }

  get isDraft() {
    return this.status === FRAMEWORK_HISTORY_STATUSES.DRAFT;
  }

  get isActive() {
    return this.status === FRAMEWORK_HISTORY_STATUSES.ACTIVE;
  }

  static buildFromVersion({ scope, version }) {
    return new Version({
      id: null,
      scope,
      startDate: null,
      expirationDate: null,
      assessmentDuration: version?.assessmentDuration ?? DEFAULT_SESSION_DURATION_MINUTES,
      minimumAnswersRequiredToValidateACertification:
        version?.minimumAnswersRequiredToValidateACertification ??
        DEFAULT_MINIMUM_ANSWERS_REQUIRED_TO_VALIDATE_A_CERTIFICATION,
      challengesConfiguration: new FlashAssessmentAlgorithmConfiguration({
        challengesBetweenSameCompetence: version?.challengesConfiguration?.challengesBetweenSameCompetence ?? 0,
        maximumAssessmentLength: version?.challengesConfiguration?.maximumAssessmentLength ?? 32,
        variationPercent: version?.challengesConfiguration?.variationPercent ?? 1,
        defaultCandidateCapacity: version?.challengesConfiguration?.defaultCandidateCapacity ?? 0,
        defaultProbabilityToPickChallenge:
          version?.challengesConfiguration?.defaultProbabilityToPickChallenge ?? DEFAULT_PROBABILITY_TO_PICK_CHALLENGE,
        limitToOneQuestionPerTube: version?.challengesConfiguration?.limitToOneQuestionPerTube ?? true,
        enablePassageByAllCompetences: version?.challengesConfiguration?.enablePassageByAllCompetences ?? true,
      }),
      globalScoringConfiguration: version?.globalScoringConfiguration ?? [],
      competencesScoringConfiguration: version?.competencesScoringConfiguration ?? [],
      comments: null,
    });
  }
}
