import Joi from 'joi';

import { uuidSchema } from '../utils.js';

const downloadElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('download').required(),
  files: Joi.array()
    .items({
      url: Joi.string().uri({ scheme: 'https' }).required(),
      format: Joi.string().required(),
    })
    .required(),
}).required();

export { downloadElementSchema };
