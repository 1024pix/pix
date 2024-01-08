import Joi from 'joi';
import { uuidSchema } from '../utils.js';

const imageElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('image').required(),
  url: Joi.string().required(),
  alt: Joi.string().required(),
  alternativeText: Joi.string().required(),
}).required();

export { imageElementSchema };
