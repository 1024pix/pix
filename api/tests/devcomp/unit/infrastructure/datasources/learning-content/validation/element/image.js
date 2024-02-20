import Joi from 'joi';
import { htmlSchema, uuidSchema } from '../utils.js';

const imageElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('image').required(),
  url: Joi.string().uri().required(),
  alt: Joi.string().allow('').required(),
  alternativeText: htmlSchema.allow(''),
}).required();

export { imageElementSchema };
