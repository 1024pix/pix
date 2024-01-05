import Joi from 'joi';
import { uuidSchema } from '../utils.js';

const videoElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('video').required(),
  title: Joi.string().required(),
  url: Joi.string().required(),
  subtitles: Joi.string().required(),
  transcription: Joi.string().required(),
  alternativeText: Joi.string().required(),
}).required();

export { videoElementSchema };
