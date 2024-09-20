import Joi from 'joi';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const image = Joi.object({
  url: Joi.string().uri().required(),
});

const cardSide = Joi.object({
  image,
  text: htmlNotAllowedSchema.required(),
});

const flashcardsElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('flashcards').required(),
  title: htmlNotAllowedSchema.required(),
  instruction: htmlSchema.optional(),
  introImage: image,
  cards: Joi.array().items({
    id: uuidSchema,
    recto: cardSide,
    verso: cardSide,
  }),
}).required();

export { flashcardsElementSchema };
