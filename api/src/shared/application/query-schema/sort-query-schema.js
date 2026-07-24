import Joi from 'joi';

import { createObjectQuerySchema } from './object-query-schema.js';

const sortArraySchema = Joi.array().items(
  Joi.object({
    value: Joi.string().empty('').required(),
    type: Joi.string().valid('asc', 'desc').empty(['', null]).allow(null).optional(),
  }),
);

// example array is set itself into an array to appear as a simple array in Swagger default section
// (default behaviour in swagger, with separated sort items, adds multiple sort query params, and not an array)
function createSortQuerySchema({ example = [[{ value: 'id', type: 'asc' }]] } = {}) {
  const schema = createObjectQuerySchema({
    paramName: 'sort',
    valueSchema: sortArraySchema,
  }).description(
    'Paramètres de tri, en bracket notation (sort[0][value]=name&sort[0][type]=asc) ou en tableau JSON encodé dans l’URL (sort=[{"value":"name","type":"asc"}]).',
  );

  return schema.example(example);
}

export { createSortQuerySchema };
