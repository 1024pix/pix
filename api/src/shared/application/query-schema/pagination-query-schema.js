import Joi from 'joi';

import { createObjectQuerySchema } from './object-query-schema.js';

function createPageQuerySchema({ maxSize = 200 } = {}) {
  const pageObjectSchema = Joi.object({
    number: Joi.number().integer().positive().empty('').allow(null).optional().description('Numéro de la page'),
    size: Joi.number()
      .integer()
      .positive()
      .max(maxSize)
      .empty('')
      .allow(null)
      .optional()
      .description("Nombre d'éléments par page"),
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

  return pageQuerySchema;
}

export { createPageQuerySchema };
