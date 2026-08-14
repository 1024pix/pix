import Joi from 'joi';

import { createObjectQuerySchema } from './object-query-schema.js';

function createPageQuerySchema({ maxSize = 200, defaultValue = {} } = {}) {
  const pageObjectSchema = Joi.object({
    number: Joi.number()
      .integer()
      .positive()
      .empty('')
      .allow(null)
      .optional()
      .description('Numéro de la page (commence à 1)'),
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
    .description('Paramètres de pagination')
    .default(defaultValue)
    .example({ page: { number: 1, size: 10 } });

  return pageQuerySchema;
}

export { createPageQuerySchema };
