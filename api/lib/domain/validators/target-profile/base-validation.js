import Joi from 'joi';
import { first } from 'lodash';
import { EntityValidationError } from '../../errors';
import TargetProfile from '../../models/TargetProfile';

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

export default {
  validate,
  schema,
};
