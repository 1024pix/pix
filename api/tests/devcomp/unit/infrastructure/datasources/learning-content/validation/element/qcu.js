import Joi from 'joi';
import { uuidSchema, proposalIdSchema, htmlSchema } from '../utils.js';

const qcuElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('qcu').required(),
  instruction: htmlSchema,
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
