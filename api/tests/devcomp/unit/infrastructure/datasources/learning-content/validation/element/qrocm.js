import Joi from 'joi';

import { htmlNotAllowedSchema, htmlSchema, proposalIdSchema, uuidSchema } from '../utils.js';

const blockInputSchema = Joi.object({
  input: htmlNotAllowedSchema.required(),
  type: Joi.string().valid('input').required(),
  inputType: Joi.string().valid('text', 'number').required(),
  size: Joi.number().positive().required(),
  display: Joi.string().valid('inline', 'block').required(),
  placeholder: htmlNotAllowedSchema.allow('').required(),
  ariaLabel: htmlNotAllowedSchema.required(),
  defaultValue: htmlNotAllowedSchema.allow('').required(),
  tolerances: Joi.array()
    .unique()
    .items(Joi.string().valid('t1', 't2', 't3'))
    .required(),
  solutions: Joi.array().items(Joi.string().required()).required(),
}).required();

const blockSelectSchema = Joi.object({
  input: htmlNotAllowedSchema.required(),
  type: Joi.string().valid('select').required(),
  display: Joi.string().valid('inline', 'block').required(),
  placeholder: htmlNotAllowedSchema.allow('').required(),
  ariaLabel: htmlNotAllowedSchema.required(),
  defaultValue: htmlNotAllowedSchema.allow('').required(),
  tolerances: Joi.array().empty().required(),
  options: Joi.array()
    .items(
      Joi.object({
        id: proposalIdSchema,
        content: htmlNotAllowedSchema.required(),
      }),
    )
    .required(),
  solutions: Joi.array().items(proposalIdSchema).required(),
}).required();

const blockTextSchema = Joi.object({
  type: Joi.string().valid('text').required(),
  content: htmlSchema,
}).required();

const qrocmElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('qrocm').required(),
  instruction: htmlSchema,
  proposals: Joi.array()
    .items(Joi.alternatives().try(blockTextSchema, blockInputSchema, blockSelectSchema))
    .required(),
  feedbacks: Joi.object({
    valid: htmlSchema,
    invalid: htmlSchema,
  }).required(),
});

export { blockInputSchema, blockSelectSchema, qrocmElementSchema };
