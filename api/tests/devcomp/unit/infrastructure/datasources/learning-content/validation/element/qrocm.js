import Joi from 'joi';
import { uuidSchema, proposalIdSchema } from '../utils.js';

const blockInputSchema = Joi.object({
  input: Joi.string().required(),
  type: Joi.string().valid('input').required(),
  inputType: Joi.string().valid('text', 'number').required(),
  size: Joi.number().positive().required(),
  display: Joi.string().valid('inline', 'block').required(),
  placeholder: Joi.string().allow('').required(),
  ariaLabel: Joi.string().required(),
  defaultValue: Joi.string().allow('').required(),
  tolerances: Joi.array()
    .unique()
    .items(Joi.string().valid('t1', 't2', 't3'))
    .required(),
  solutions: Joi.array().items(Joi.string().required()).required(),
}).required();

const blockSelectSchema = Joi.object({
  input: Joi.string().required(),
  type: Joi.string().valid('select').required(),
  display: Joi.string().valid('inline', 'block').required(),
  placeholder: Joi.string().allow('').required(),
  ariaLabel: Joi.string().required(),
  defaultValue: Joi.string().allow('').required(),
  tolerances: Joi.array().empty().required(),
  options: Joi.array()
    .items(
      Joi.object({
        id: proposalIdSchema,
        content: Joi.string().required(),
      }),
    )
    .required(),
  solutions: Joi.array().items(proposalIdSchema).required(),
}).required();

const blockTextSchema = Joi.object({
  type: Joi.string().valid('text').required(),
  content: Joi.string().required(),
}).required();

const qrocmElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('qrocm').required(),
  instruction: Joi.string().required(),
  proposals: Joi.array()
    .items(Joi.alternatives().try(blockTextSchema, blockInputSchema, blockSelectSchema))
    .required(),
  feedbacks: Joi.object({
    valid: Joi.string().required(),
    invalid: Joi.string().required(),
  }).required(),
});

export { qrocmElementSchema };
