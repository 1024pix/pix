import Joi from 'joi';

import { audioElementSchema } from './element/audio-schema.js';
import { customDraftElementSchema } from './element/custom-draft-element-schema.js';
import { customElementSchema } from './element/custom-element-schema.js';
import { downloadElementSchema } from './element/download-schema.js';
import { embedElementSchema } from './element/embed-schema.js';
import { expandElementSchema } from './element/expand-schema.js';
import { flashcardsElementSchema } from './element/flashcards-schema.js';
import { imageElementSchema } from './element/image-schema.js';
import { qabElementSchema } from './element/qab-schema.js';
import { qcmElementSchema } from './element/qcm-schema.js';
import { qcuDeclarativeElementSchema } from './element/qcu-declarative-schema.js';
import { qcuDiscoveryElementSchema } from './element/qcu-discovery-schema.js';
import { qcuElementSchema } from './element/qcu-schema.js';
import { qrocmElementSchema } from './element/qrocm-schema.js';
import { separatorElementSchema } from './element/separator-schema.js';
import { shortVideoElementSchema } from './element/short-video-schema.js';
import { textElementSchema } from './element/text-schema.js';
import { videoElementSchema } from './element/video-schema.js';
import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from './utils.js';

const ALLOWED_ELEMENTS_SCHEMA = [
  { is: 'audio', then: audioElementSchema },
  { is: 'custom', then: customElementSchema },
  { is: 'custom-draft', then: customDraftElementSchema },
  { is: 'download', then: downloadElementSchema },
  { is: 'embed', then: embedElementSchema },
  { is: 'expand', then: expandElementSchema },
  { is: 'flashcards', then: flashcardsElementSchema },
  { is: 'image', then: imageElementSchema },
  { is: 'qab', then: qabElementSchema },
  { is: 'qcu', then: qcuElementSchema },
  { is: 'qcu-declarative', then: qcuDeclarativeElementSchema },
  { is: 'qcu-discovery', then: qcuDiscoveryElementSchema },
  { is: 'qcm', then: qcmElementSchema },
  { is: 'qrocm', then: qrocmElementSchema },
  { is: 'separator', then: separatorElementSchema },
  { is: 'short-video', then: shortVideoElementSchema },
  { is: 'text', then: textElementSchema },
  { is: 'video', then: videoElementSchema },
];

const ELEMENTS_FORBIDDEN_IN_STEPPER = ['flashcards', 'qab'];

const moduleDetailsSchema = Joi.object({
  image: Joi.string()
    .uri()
    .required()
    .description(
      'Image qui s’affiche dans l’en-tête du module. Exemple: https://assets.pix.org/modules/placeholder-details.svg.',
    ),
  description: htmlSchema.required().description('Texte d’introduction en dessous du titre du module.'),
  duration: Joi.number()
    .integer()
    .min(0)
    .max(120)
    .required()
    .description('Durée du module (en minutes). Valeur acceptée: entre 0 et 120. Ne pas inclure l’unité.'),
  level: Joi.string().valid('novice', 'independent', 'advanced', 'expert').required().description('Niveau du module.'),
  objectives: Joi.array()
    .items(htmlSchema)
    .min(1)
    .required()
    .description('Un objectif minimum. Ils s’affichent dans l’ordre contribué.'),
  tabletSupport: Joi.string()
    .valid('comfortable', 'inconvenient', 'obstructed')
    .required()
    .description(
      "Si la valeur est inconvenient ou obstructed, on indiquera à l'utilisateur que le module peut être difficile à réaliser sur un petit écran.",
    ),
});

const elementSchema = Joi.alternatives().conditional('.type', {
  switch: ALLOWED_ELEMENTS_SCHEMA,
});

const stepperElementSchema = Joi.alternatives().conditional('.type', {
  switch: ALLOWED_ELEMENTS_SCHEMA.filter((elementSchema) => !ELEMENTS_FORBIDDEN_IN_STEPPER.includes(elementSchema.is)),
});

const componentElementSchema = Joi.object({
  type: Joi.string().valid('element').required(),
  element: elementSchema.required(),
});

const componentStepperSchema = Joi.object({
  type: Joi.string().valid('stepper').required(),
  instruction: htmlSchema
    .allow('')
    .required()
    .description("Instruction du stepper. S'affiche uniquement pour le stepper horizontal."),
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
  type: Joi.string()
    .valid('short-lesson', 'discovery', 'activity', 'challenge', 'lesson', 'summary', 'transition')
    .required(),
  title: htmlNotAllowedSchema
    .required()
    .allow('')
    .description('Titre du grain. Usage interne pour faciliter la navigation sur Modulix Editor.'),
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

const moduleSectionSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string()
    .valid('question-yourself', 'explore-to-understand', 'retain-the-essentials', 'practise', 'go-further', 'blank')
    .required(),
  grains: Joi.array().items(grainSchema).required(),
});

const moduleGlossarySchema = Joi.object({
  id: uuidSchema,
  word: Joi.string().required(),
  definition: htmlSchema.required(),
});

const moduleSchema = Joi.object({
  id: uuidSchema.description('Identifiant universel unique (uuid) du module.'),
  shortId: Joi.string().length(8).required().description("Identifiant court unique du module, présent dans l'url."),
  slug: Joi.string()
    .regex(/^[a-z0-9-]+$/)
    .required()
    .description(
      "Identifiant texte unique du module, présent dans l'url. Caractères autorisés : Tout caractère entre a et z (minuscules), tout chiffre (0 à 9) et le trait d'union (-).",
    ),
  title: htmlNotAllowedSchema.required().description('Titre du module.'),
  isBeta: Joi.boolean().required(),
  visibility: Joi.string()
    .valid('private', 'public')
    .required()
    .description(
      'Valeurs acceptées : private, public. Si vous indiquez "public", le module pourra être sélectionné à la création d’un contenu formatif dans Pix Admin.',
    ),
  details: moduleDetailsSchema.required(),
  sections: Joi.array().items(moduleSectionSchema).required(),
  glossary: Joi.array().items(moduleGlossarySchema).required(),
}).required();

export { componentStepperSchema, grainSchema, moduleSchema };
