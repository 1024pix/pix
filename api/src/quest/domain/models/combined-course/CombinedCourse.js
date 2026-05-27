import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';

const schema = Joi.object({
  id: Joi.number().allow(null),
  code: Joi.string().required(),
  organizationId: Joi.number().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(null),
  illustration: Joi.string().allow(null),
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

    this.#validate({ id, code, organizationId, name, description, illustration });

    this.#quest = quest;
  }

  get quest() {
    return this.#quest;
  }

  get participationsCount() {
    return this.participations.length;
  }

  get completedParticipationsCount() {
    return this.participations.filter((participation) => participation.isCompleted()).length;
  }

  #validate(combinedCourse) {
    const { error } = schema.validate(combinedCourse);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details, undefined, { data: combinedCourse });
    }
  }
}
