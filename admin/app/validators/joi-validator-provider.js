import Joi from 'joi';

export const joiValidatorProvider = {
  validate: ({ schema, data }) => {
    if (!Joi.isSchema(schema)) {
      return console.error('Please provide a valid Joi schema');
    }
    const response = schema.validate(data, { abortEarly: false });

    const formattedErrors = _formatJoiErrors(response.error);

    return { value: response.value, error: formattedErrors };
  },
};

function _formatJoiErrors(error) {
  if (!error || !error.details) return null;
  return error.details.reduce((result, detail) => {
    const key = detail.path.join('.');
    if (!key.length) return detail.message;

    if (!result[key]) {
      result[key] = detail.message;
    }

    return result;
  }, {});
}
