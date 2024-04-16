import Joi from 'joi';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const imageElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('image').required(),
  url: Joi.string().uri().required(),
  alt: htmlNotAllowedSchema.allow('').required(),
  alternativeText: htmlSchema.allow(''),
}).required();

export { imageElementSchema };
