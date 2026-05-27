import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';

const schema = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'CAMPAIGN_NAME_IS_REQUIRED',
    'string.empty': 'CAMPAIGN_NAME_IS_REQUIRED',
  }),
  organizationId: Joi.number().required(),
  blueprintId: Joi.number().required().messages({
    'any.required': 'TARGET_PROFILE_IS_REQUIRED',
    'number.base': 'TARGET_PROFILE_IS_REQUIRED',
  }),
});

export class CombinedCourseForCreation {
  constructor({ name, organizationId, blueprintId } = {}) {
    this.name = name;
    this.organizationId = organizationId;
    this.blueprintId = blueprintId;

    this.#validate({ name, organizationId, blueprintId });
  }

  #validate(combinedCourse) {
    const { error } = schema.validate(combinedCourse);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details, undefined, { data: combinedCourse });
    }
  }
}
