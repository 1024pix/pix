import Joi from 'joi';

const pageObjectSchema = Joi.object({
  number: Joi.number().integer().positive().empty('').allow(null).optional(),
  size: Joi.number().integer().positive().max(200).empty('').allow(null).optional(),
});

const pageQuerySchema = Joi.alternatives()
  .try(
    pageObjectSchema,
    Joi.string().custom((value, helpers) => {
      let parsedValue;
      try {
        parsedValue = JSON.parse(value);
      } catch {
        return helpers.error('any.invalid');
      }

      const { error, value: validatedValue } = pageObjectSchema.validate(parsedValue);
      if (error) {
        return helpers.error('any.invalid');
      }

      return validatedValue;
    }),
  )
  .default({})
  .description(
    'Paramètres de pagination, en bracket notation (page[number]=1&page[size]=10) ou en objet JSON encodé dans l’URL (page={"number":1,"size":10}).',
  )
  .example({ page: { number: 1, size: 10 } });

export { pageQuerySchema };
