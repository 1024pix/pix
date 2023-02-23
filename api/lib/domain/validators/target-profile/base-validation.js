const Joi = require('joi');
const { first } = require('lodash');
const { EntityValidationError } = require('../../errors.js');
const TargetProfile = require('../../models/TargetProfile.js');

const categories = TargetProfile.categories;

const schema = Joi.object({
  category: Joi.string()
    .valid(
      categories.COMPETENCES,
      categories.CUSTOM,
      categories.DISCIPLINE,
      categories.OTHER,
      categories.PREDEFINED,
      categories.SUBJECT
    )
    .required()
    .error((errors) => first(errors))
    .messages({
      'any.required': 'CATEGORY_IS_REQUIRED',
      'string.base': 'CATEGORY_IS_REQUIRED',
      'any.only': 'CATEGORY_IS_REQUIRED',
    }),

  name: Joi.string().required().messages({
    'any.required': 'NAME_IS_REQUIRED',
    'string.base': 'NAME_IS_REQUIRED',
    'string.empty': 'NAME_IS_REQUIRED',
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
  schema,
};
