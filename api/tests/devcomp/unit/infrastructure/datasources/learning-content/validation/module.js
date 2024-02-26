import Joi from 'joi';
import {
  imageElementSchema,
  qcuElementSchema,
  qcmElementSchema,
  qrocmElementSchema,
  textElementSchema,
  videoElementSchema,
} from './element/index.js';
import { htmlSchema, uuidSchema } from './utils.js';

const transitionTextSchema = Joi.object({
  grainId: uuidSchema,
  content: htmlSchema,
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
            Joi.alternatives().conditional('.type', {
              switch: [
                { is: 'text', then: textElementSchema },
                { is: 'image', then: imageElementSchema },
                { is: 'qcu', then: qcuElementSchema },
                { is: 'qcm', then: qcmElementSchema },
                { is: 'qrocm', then: qrocmElementSchema },
                { is: 'video', then: videoElementSchema },
              ],
            }),
          )
          .required(),
      }).required(),
    )
    .required(),
}).required();

export { moduleSchema };
