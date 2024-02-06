import Joi from 'joi';
import { uuidSchema } from '../utils.js';

const imageElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('image').required(),
  url: Joi.string().uri().required(),
  alt: Joi.string().allow('').required(),
  alternativeText: Joi.string().allow('').required(),
}).required();

export { imageElementSchema };
