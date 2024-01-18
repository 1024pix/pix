import Joi from 'joi';
import {
  imageElementSchema,
  qcuElementSchema,
  qrocmElementSchema,
  textElementSchema,
  videoElementSchema,
} from './element/index.js';
import { uuidSchema } from './utils.js';

const transitionTextSchema = Joi.object({
  grainId: uuidSchema,
  content: Joi.string().required(),
}).required();

const moduleSchema = Joi.object({
  id: uuidSchema,
  slug: Joi.string()
    .regex(/^[a-z0-9-]+$/)
    .required(),
  title: Joi.string().required(),
  details: Joi.object({
    image: Joi.string().uri().required(),
    description: Joi.string().required(),
    duration: Joi.number().integer().min(0).max(120).required(),
    level: Joi.string().valid('Débutant', 'Intermédiaire', 'Avancé', 'Expert').required(),
    objectives: Joi.array().items(Joi.string()).min(1).required(),
  }).required(),
  transitionTexts: Joi.array().items(transitionTextSchema),
  grains: Joi.array()
    .items(
      Joi.object({
        id: uuidSchema,
        type: Joi.string().valid('lesson', 'activity').required(),
        title: Joi.string().required(),
        elements: Joi.array()
          .items(
            Joi.alternatives().try(
              textElementSchema,
              imageElementSchema,
              qcuElementSchema,
              qrocmElementSchema,
              videoElementSchema,
            ),
          )
          .required(),
      }).required(),
    )
    .required(),
}).required();

export { moduleSchema };
