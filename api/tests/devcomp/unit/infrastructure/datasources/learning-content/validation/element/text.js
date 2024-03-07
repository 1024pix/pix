import Joi from 'joi';

import { htmlSchema, uuidSchema } from '../utils.js';

const textElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('text').required(),
  content: htmlSchema,
}).required();

export { textElementSchema };
