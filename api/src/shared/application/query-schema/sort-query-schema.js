import Joi from 'joi';

import { createJsonStringSchema } from './object-query-schema.js';

const sortItemSchema = Joi.object({
  value: Joi.string().empty('').required(),
  type: Joi.string().valid('asc', 'desc').empty(['', null]).allow(null).optional(),
});

// Swagger (OpenAPI) serializes an array of objects as repeated query params (sort={"value":"a"}&sort={"value":"b"}),
// which Hapi/qs collects into an array of raw JSON strings instead of an array of objects, so each item must
// itself accept either an object or a JSON-encoded string.
const sortItemOrJsonStringSchema = Joi.alternatives().try(sortItemSchema, createJsonStringSchema(sortItemSchema, 'sort'));

function createSortQuerySchema({ example = { value: 'id', type: 'asc' } } = {}) {
  return Joi.array()
    .items(sortItemOrJsonStringSchema)
    .description(
      'Paramètres de tri, en bracket notation (sort[0][value]=name&sort[0][type]=asc) ou en paramètres répétés (sort={"value":"name"}&sort={"value":"other"}).',
    )
    .example([example]);
}

export { createSortQuerySchema };
