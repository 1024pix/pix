import Joi from 'joi';

import { TargetProfile } from '../../../../shared/domain/models/TargetProfile.js';

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
      categories.TARGETED,
      categories.BACK_TO_SCHOOL,
    )
    .required()
    .error((errors) => errors?.at(0))
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

export { schema };
