import Joi from 'joi';

import { htmlSchema, proposalIdSchema, uuidSchema } from '../utils.js';

const qcmElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('qcm').required(),
  instruction: htmlSchema.required(),
  proposals: Joi.array()
    .items({
      id: proposalIdSchema,
      content: htmlSchema,
    })
    .min(3)
    .required(),
  feedbacks: Joi.object({
    valid: htmlSchema,
    invalid: htmlSchema,
  }).required(),
  solutions: Joi.array().items(proposalIdSchema).min(2).required(),
}).required();

export { qcmElementSchema };
