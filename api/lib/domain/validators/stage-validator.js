import Joi from 'joi';
import { EntityValidationError } from '../../../src/shared/domain/errors.js';

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const stageValidationJoiSchema = Joi.object({
  title: Joi.string().required().messages({
    'string.base': 'STAGE_TITLE_IS_REQUIRED',
    'string.empty': 'STAGE_TITLE_IS_REQUIRED',
  }),

  threshold: Joi.number().integer().required().messages({
    'number.base': 'STAGE_THRESHOLD_IS_REQUIRED',
  }),

  targetProfileId: Joi.number().required().integer().messages({
    'number.base': 'STAGE_TARGET_PROFILE_IS_REQUIRED',
  }),
});

const validate = function ({ stage }) {
  const { error } = stageValidationJoiSchema.validate(stage, { ...validationConfiguration });
  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }
  return true;
};

export { validate };
