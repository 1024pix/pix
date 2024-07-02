import Joi from 'joi';

import { htmlNotAllowedSchema, uuidSchema } from '../utils.js';

const embedSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('embed').required(),
  isCompletionRequired: Joi.boolean().valid(false).required(),
  title: htmlNotAllowedSchema.required(),
  url: Joi.string().uri().required(),
  height: Joi.number().min(0).required(),
}).required();

export { embedSchema };
