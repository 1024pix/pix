import Joi from 'joi';

import { htmlSchema, proposalIdSchema, uuidSchema } from '../utils.js';

const qcuElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('qcu').required(),
  instruction: htmlSchema.required(),
  proposals: Joi.array()
    .items({
      id: proposalIdSchema,
      content: htmlSchema,
    })
    .required(),
  feedbacks: Joi.object({
    valid: htmlSchema,
    invalid: htmlSchema,
  }).required(),
  solution: proposalIdSchema,
}).required();

export { qcuElementSchema };
