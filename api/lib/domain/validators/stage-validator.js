const Joi = require('joi');
const { EntityValidationError } = require('../errors');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const stageValidationJoiSchema = Joi.object({

  title: Joi.string()
    .required()
    .messages({
      'string.base': 'STAGE_TITLE_IS_REQUIRED',
    }),

  threshold: Joi.number()
    .integer()
    .messages({
      'number.base': 'STAGE_THRESHOLD_IS_REQUIRED',
    }),

  targetProfileId: Joi.number()
    .integer()
    .messages({
      'number.base': 'TARGET_PROFILE_IS_REQUIRED',
    }),
});

module.exports = {
  validate({ stage }) {
    const { error } = stageValidationJoiSchema.validate(stage, { ...validationConfiguration });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
    return true;
  },
};
