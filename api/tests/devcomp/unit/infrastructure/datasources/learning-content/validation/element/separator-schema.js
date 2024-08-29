import Joi from 'joi';

import { uuidSchema } from '../utils.js';

const separatorElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('separator').required(),
}).required();

export { separatorElementSchema };
