import Joi from 'joi';
import { uuidSchema } from '../utils.js';

const videoElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('video').required(),
  title: Joi.string().required(),
  url: Joi.string().uri().required(),
  subtitles: Joi.string().required(),
  transcription: Joi.string().allow('').required(),
}).required();

export { videoElementSchema };
