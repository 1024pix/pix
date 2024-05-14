import Joi from 'joi';
import lodash from 'lodash';

const { first } = lodash;

import { EntityValidationError } from '../../../../src/shared/domain/errors.js';
import { TargetProfile } from '../../models/TargetProfile.js';

const categories = TargetProfile.categories;

const schema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'NAME_IS_REQUIRED',
    'string.base': 'NAME_IS_REQUIRED',
    'string.empty': 'NAME_IS_REQUIRED',
  }),
  category: Joi.string()
    .valid(
      categories.COMPETENCES,
      categories.CUSTOM,
      categories.DISCIPLINE,
      categories.OTHER,
      categories.PIX_PLUS,
      categories.PREDEFINED,
      categories.SUBJECT,
    )
    .required()
    .error((errors) => first(errors))
    .messages({
      'any.required': 'CATEGORY_IS_REQUIRED',
      'string.base': 'CATEGORY_IS_REQUIRED',
      'any.only': 'CATEGORY_IS_REQUIRED',
    }),
  imageUrl: Joi.string().uri().required().messages({
    'any.required': 'IMAGE_URL_IS_REQUIRED',
    'string.base': 'IMAGE_URL_IS_REQUIRED',
    'string.empty': 'IMAGE_URL_IS_REQUIRED',
    'string.uri': 'IMAGE_URL_IS_REQUIRED',
  }),
});

function validate(targetProfile) {
  const { error } = schema.validate(targetProfile, { abortEarly: false, allowUnknown: true });
  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }
  return true;
}

export { schema, validate };
