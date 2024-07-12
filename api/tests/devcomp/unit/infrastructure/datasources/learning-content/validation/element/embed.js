import Joi from 'joi';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const embedSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('embed').required(),
  isCompletionRequired: Joi.boolean().valid(false).required(),
  title: htmlNotAllowedSchema.required(),
  url: Joi.string().uri().required(),
  instruction: htmlSchema.optional(),
  height: Joi.number().min(0).required(),
}).required();

export { embedSchema };
