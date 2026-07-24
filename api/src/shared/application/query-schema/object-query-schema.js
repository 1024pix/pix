import Joi from 'joi';

function createObjectQuerySchema({ paramName, valueSchema }) {
  return Joi.alternatives().try(
    valueSchema,
    Joi.string().custom((value, helpers) => {
      let parsedValue;
      try {
        parsedValue = JSON.parse(value);
      } catch (err) {
        return helpers.message(`"${paramName}" must be a valid JSON string: ${err.message}`);
      }

      const { error, value: validatedValue } = valueSchema.validate(parsedValue);
      if (error) {
        return helpers.message(error.message);
      }

      return validatedValue;
    }),
  );
}

export { createObjectQuerySchema };
