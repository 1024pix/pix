import Joi from 'joi';

import { createObjectQuerySchema } from './object-query-schema.js';

const pageObjectSchema = Joi.object({
  number: Joi.number().integer().positive().empty('').allow(null).optional(),
  size: Joi.number().integer().positive().max(200).empty('').allow(null).optional(),
});

const pageQuerySchema = createObjectQuerySchema({
  paramName: 'page',
  valueSchema: pageObjectSchema,
})
  .default({})
  .description(
    'Paramètres de pagination, en bracket notation (page[number]=1&page[size]=10) ou en objet JSON encodé dans l’URL (page={"number":1,"size":10}).',
  )
  .example({ page: { number: 1, size: 10 } });

export { pageQuerySchema };
