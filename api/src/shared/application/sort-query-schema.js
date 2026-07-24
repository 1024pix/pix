import Joi from 'joi';

const sortArraySchema = Joi.array().items(
  Joi.object({
    value: Joi.string().empty('').required(),
    type: Joi.string().valid('asc', 'desc').empty(['', null]).allow(null).optional(),
  }),
);

// example array is set itself into an array to appear as a simple array in Swagger default section
// (default behaviour in swagger, with separated sort items, adds multiple sort query params, and not an array)
function createSortQuerySchema({ example = [[{ value: 'id', type: 'asc' }]] } = {}) {
  const schema = Joi.alternatives()
    .try(
      sortArraySchema,
      Joi.string().custom((value, helpers) => {
        let parsedValue;
        try {
          parsedValue = JSON.parse(value);
        } catch (err) {
          return helpers.message(`"sort" must be a valid JSON string: ${err.message}`);
        }

        const { error, value: validatedValue } = sortArraySchema.validate(parsedValue);
        if (error) {
          return helpers.message(error.message);
        }

        return validatedValue;
      }),
    )
    .description(
      'Paramètres de tri, en bracket notation (sort[0][value]=name&sort[0][type]=asc) ou en tableau JSON encodé dans l’URL (sort=[{"value":"name","type":"asc"}]).',
    );

  return schema.example(example);
}

export { createSortQuerySchema };
