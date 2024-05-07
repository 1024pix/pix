import Joi from 'joi';

import {
  imageElementSchema,
  qcmElementSchema,
  qcuElementSchema,
  qrocmElementSchema,
  textElementSchema,
  videoElementSchema,
} from './element/index.js';
import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from './utils.js';

const transitionTextSchema = Joi.object({
  grainId: uuidSchema,
  content: htmlSchema,
}).required();

const moduleDetailsSchema = Joi.object({
  image: Joi.string().uri().required(),
  description: htmlNotAllowedSchema.required(),
  duration: Joi.number().integer().min(0).max(120).required(),
  level: Joi.string().valid('Débutant', 'Intermédiaire', 'Avancé', 'Expert').required(),
  objectives: Joi.array().items(htmlNotAllowedSchema).min(1).required(),
});

const elementSchema = Joi.alternatives().conditional('.type', {
  switch: [
    { is: 'text', then: textElementSchema },
    { is: 'image', then: imageElementSchema },
    { is: 'qcu', then: qcuElementSchema },
    { is: 'qcm', then: qcmElementSchema },
    { is: 'qrocm', then: qrocmElementSchema },
    { is: 'video', then: videoElementSchema },
  ],
});

const grainSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('lesson', 'activity').required(),
  title: htmlNotAllowedSchema.required(),
  components: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('element').required(),
      element: elementSchema.required(),
    }),
  ),
}).required();

const moduleSchema = Joi.object({
  id: uuidSchema,
  slug: Joi.string()
    .regex(/^[a-z0-9-]+$/)
    .required(),
  title: htmlNotAllowedSchema.required(),
  details: moduleDetailsSchema.required(),
  transitionTexts: Joi.array().items(transitionTextSchema),
  grains: Joi.array().items(grainSchema).required(),
}).required();

export { grainSchema, moduleDetailsSchema, moduleSchema };
