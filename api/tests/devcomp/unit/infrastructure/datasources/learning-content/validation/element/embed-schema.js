import Joi from 'joi';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const embedElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('embed').required(),
  isCompletionRequired: Joi.boolean().required(),
  title: htmlNotAllowedSchema.required(),
  url: Joi.string().uri().required(),
  instruction: htmlSchema.optional(),
  solution: Joi.when('isCompletionRequired', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.any().forbidden(),
  }),
  height: Joi.number().min(0).required(),
}).required();

export { embedElementSchema };
