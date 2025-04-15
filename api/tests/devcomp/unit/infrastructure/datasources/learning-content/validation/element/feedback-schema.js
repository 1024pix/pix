import Joi from 'joi';

import { htmlSchema } from '../utils.js';

export const feedbackSchema = Joi.object({
  state: htmlSchema.allow('').required(),
  diagnosis: htmlSchema.allow('').required(),
}).or('state', 'diagnosis', { isPresent: (resolved) => resolved !== undefined && resolved !== '' });
