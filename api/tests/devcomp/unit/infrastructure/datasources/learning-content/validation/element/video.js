import Joi from 'joi';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const videoElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('video').required(),
  title: htmlNotAllowedSchema.required(),
  url: Joi.string().uri().required(),
  subtitles: Joi.string().uri().allow('').required(),
  transcription: htmlSchema.allow(''),
}).required();

export { videoElementSchema };
