import Joi from 'joi';

import { CombinedCourseParticipationStatuses } from '../../../../../prescription/shared/domain/constants.ts';
import { EntityValidationError } from '../../../../../shared/domain/errors.js';
import { OrganizationLearnerParticipation } from '../../combined-course-participations/entities/OrganizationLearnerParticipation.js';

const schema = Joi.object({
  id: Joi.number().allow(null),
  code: Joi.string().required(),
  organizationId: Joi.number().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(null),
  illustration: Joi.string().allow(null),
  participations: Joi.array().items(Joi.object().instance(OrganizationLearnerParticipation)),
  questId: Joi.number(),
  blueprintId: Joi.number().allow(null),
  deletedAt: Joi.date().allow(null),
  deletedBy: Joi.number().allow(null),
  baseSurveyUrl: Joi.string().uri().allow(null),
});
export class CombinedCourse {
  #quest;

  constructor(
    {
      id,
      code,
      organizationId,
      name,
      description,
      illustration,
      participations = [],
      questId,
      blueprintId = null,
      deletedAt = null,
      deletedBy = null,
      baseSurveyUrl = null,
    } = {},
    quest,
  ) {
    this.id = id;
    this.code = code;
    this.organizationId = organizationId;
    this.name = name;
    this.description = description;
    this.illustration = illustration;
    this.participations = participations;
    this.questId = questId;
    this.blueprintId = blueprintId;
    this.deletedAt = deletedAt;
    this.deletedBy = deletedBy;
    this.baseSurveyUrl = baseSurveyUrl;

    this.#validate();

    this.#quest = quest;
  }

  get quest() {
    return this.#quest;
  }

  get participationsCount() {
    return this.participations.length;
  }

  get completedParticipationsCount() {
    return this.participations.filter(
      (participation) => participation.status === CombinedCourseParticipationStatuses.COMPLETED,
    ).length;
  }

  #validate() {
    const { error } = schema.validate(this);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details, undefined, { data: this });
    }
  }
}
