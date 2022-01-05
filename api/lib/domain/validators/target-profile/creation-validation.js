const Joi = require('joi');
const { schema: base } = require('./base-validation');
const { EntityValidationError } = require('../../errors');

const schema = base.keys({
  skillIds: Joi.array().items(Joi.any().invalid(null)).min(1).empty(null).required().messages({
    'any.required': 'SKILLS_REQUIRED',
    'any.invalid': 'SKILLS_REQUIRED',
    'array.min': 'SKILLS_REQUIRED',
  }),
});

function validate(targetProfile) {
  const { error } = schema.validate(targetProfile, { abortEarly: false, allowUnknown: true });
  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }
  return true;
}

module.exports = {
  validate,
};
