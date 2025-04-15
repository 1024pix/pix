import Joi from 'joi';

import { customElementSchema } from './element/custom-element-schema.js';
import { downloadElementSchema } from './element/download-schema.js';
import { embedElementSchema } from './element/embed-schema.js';
import { expandElementSchema } from './element/expand-schema.js';
import { flashcardsElementSchema } from './element/flashcards-schema.js';
import { imageElementSchema } from './element/image-schema.js';
import { qcmElementSchema } from './element/qcm-schema.js';
import { qcuElementSchema } from './element/qcu-schema.js';
import { qrocmElementSchema } from './element/qrocm-schema.js';
import { separatorElementSchema } from './element/separator-schema.js';
import { textElementSchema } from './element/text-schema.js';
import { videoElementSchema } from './element/video-schema.js';
import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from './utils.js';

const transitionTextSchema = Joi.object({
  grainId: uuidSchema,
  content: htmlSchema,
}).required();

const moduleDetailsSchema = Joi.object({
  image: Joi.string().uri().required(),
  description: htmlSchema.required(),
  duration: Joi.number().integer().min(0).max(120).required(),
  level: Joi.string().valid('Débutant', 'Intermédiaire', 'Avancé', 'Expert').required(),
  objectives: Joi.array().items(htmlSchema).min(1).required(),
  tabletSupport: Joi.string().valid('comfortable', 'inconvenient', 'obstructed').required(),
});

const elementSchema = Joi.alternatives().conditional('.type', {
  switch: [
    { is: 'custom', then: customElementSchema },
    { is: 'download', then: downloadElementSchema },
    { is: 'embed', then: embedElementSchema },
    { is: 'expand', then: expandElementSchema },
    { is: 'flashcards', then: flashcardsElementSchema },
    { is: 'image', then: imageElementSchema },
    { is: 'qcu', then: qcuElementSchema },
    { is: 'qcm', then: qcmElementSchema },
    { is: 'qrocm', then: qrocmElementSchema },
    { is: 'separator', then: separatorElementSchema },
    { is: 'text', then: textElementSchema },
    { is: 'video', then: videoElementSchema },
  ],
});

const stepperElementSchema = Joi.alternatives().conditional('.type', {
  switch: [
    { is: 'custom', then: customElementSchema },
    { is: 'download', then: downloadElementSchema },
    { is: 'expand', then: expandElementSchema },
    { is: 'image', then: imageElementSchema },
    { is: 'qcu', then: qcuElementSchema },
    { is: 'qcm', then: qcmElementSchema },
    { is: 'qrocm', then: qrocmElementSchema },
    { is: 'separator', then: separatorElementSchema },
    { is: 'text', then: textElementSchema },
    { is: 'video', then: videoElementSchema },
  ],
});

const componentElementSchema = Joi.object({
  type: Joi.string().valid('element').required(),
  element: elementSchema.required(),
});

const componentStepperSchema = Joi.object({
  type: Joi.string().valid('stepper').required(),
  steps: Joi.array()
    .items(
      Joi.object({
        elements: Joi.array().items(stepperElementSchema).required(),
      }),
    )
    .min(2)
    .required(),
});

const grainSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('lesson', 'activity', 'discovery', 'challenge', 'summary', 'transition').required(),
  title: htmlNotAllowedSchema.required().allow(''),
  components: Joi.array()
    .items(
      Joi.alternatives().conditional('.type', {
        switch: [
          { is: 'element', then: componentElementSchema },
          { is: 'stepper', then: componentStepperSchema },
        ],
      }),
    )
    .external(async (value, helpers) => {
      const steppersInArray = value.filter(({ type }) => type === 'stepper');
      if (steppersInArray.length > 1) {
        return helpers.error("Il ne peut y avoir qu'un stepper par grain");
      }
      return value;
    })
    .external(async (value, helpers) => {
      const steppersInArray = value.filter(({ type }) => type === 'stepper');
      const elementsInArray = value.filter(({ type }) => type === 'element');
      const containsAnswerableElement = elementsInArray.some(({ element }) =>
        ['qcu', 'qcm', 'qrocm'].includes(element.type),
      );
      if (steppersInArray.length === 1 && containsAnswerableElement) {
        return helpers.error(
          "Un grain ne peut pas être composé d'un composant 'stepper' et d'un composant 'element' répondable (QCU, QCM ou QROCM)",
        );
      }
      return value;
    }),
}).required();

const moduleSchema = Joi.object({
  id: uuidSchema,
  slug: Joi.string()
    .regex(/^[a-z0-9-]+$/)
    .required(),
  title: htmlNotAllowedSchema.required(),
  isBeta: Joi.boolean().required(),
  details: moduleDetailsSchema.required(),
  transitionTexts: Joi.array().items(transitionTextSchema),
  grains: Joi.array().items(grainSchema).required(),
}).required();

export { grainSchema, moduleSchema };
