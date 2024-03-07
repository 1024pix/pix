import Joi from 'joi';
import { htmlSchema, uuidSchema } from '../utils.js';

const videoElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('video').required(),
  title: Joi.string().required(),
  url: Joi.string().uri().required(),
  subtitles: Joi.string().uri().allow('').required(),
  transcription: htmlSchema.allow(''),
}).required();

export { videoElementSchema };
