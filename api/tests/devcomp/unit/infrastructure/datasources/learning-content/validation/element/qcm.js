import Joi from 'joi';
import { uuidSchema, proposalIdSchema } from '../utils.js';

const qcmElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('qcm').required(),
  instruction: Joi.string().required(),
  proposals: Joi.array()
    .items({
      id: proposalIdSchema,
      content: Joi.string().required(),
    })
    .min(3)
    .required(),
  feedbacks: Joi.object({
    valid: Joi.string().required(),
    invalid: Joi.string().required(),
  }).required(),
  solutions: Joi.array().items(proposalIdSchema).min(3).required(),
}).required();

export { qcmElementSchema };
