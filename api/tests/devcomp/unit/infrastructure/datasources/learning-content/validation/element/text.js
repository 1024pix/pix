import Joi from 'joi';
import { uuidSchema } from '../utils.js';

const textElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('text').required(),
  content: Joi.string().required(),
}).required();

export { textElementSchema };
