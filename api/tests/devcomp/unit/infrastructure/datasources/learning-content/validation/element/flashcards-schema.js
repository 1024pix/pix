import Joi from 'joi';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const image = Joi.object({
  url: Joi.string().uri().required(),
});

const rectoSide = Joi.object({
  image,
  text: htmlNotAllowedSchema.required(),
});

const versoSide = Joi.object({
  image,
  text: htmlSchema.required(),
});

const flashcardsElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('flashcards').required(),
  title: htmlNotAllowedSchema.required(),
  instruction: htmlSchema.optional(),
  introImage: image,
  cards: Joi.array().items({
    id: uuidSchema,
    recto: rectoSide,
    verso: versoSide,
  }),
}).required();

export { flashcardsElementSchema };
