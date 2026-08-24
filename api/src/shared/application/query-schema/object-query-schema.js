import Joi from 'joi';

// Parses a JSON-encoded string and validates the result against valueSchema, so that
// a param can be sent either directly (bracket notation) or JSON-encoded in the URL.
function createJsonStringSchema(valueSchema, paramName) {
  return Joi.string().custom((value, helpers) => {
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
  });
}

function createObjectQuerySchema({ paramName, valueSchema }) {
  return Joi.alternatives().try(valueSchema, createJsonStringSchema(valueSchema, paramName));
}

export { createJsonStringSchema, createObjectQuerySchema };
