import Joi from 'joi';
import { uuidSchema, proposalIdSchema } from '../utils.js';

const qcuElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('qcu').required(),
  instruction: Joi.string().required(),
  proposals: Joi.array()
    .items({
      id: proposalIdSchema,
      content: Joi.string().required(),
    })
    .required(),
  feedbacks: Joi.object({
    valid: Joi.string().required(),
    invalid: Joi.string().required(),
  }).required(),
  solution: proposalIdSchema,
}).required();

export { qcuElementSchema };
