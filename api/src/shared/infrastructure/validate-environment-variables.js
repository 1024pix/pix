const validateEnvironmentVariables = function (schema) {
  const { error } = schema.validate(process.env);
  if (error) {
    throw new Error('Configuration is invalid: ' + error.message + ', but was: ' + error.details[0].context.value);
  }
};

export { validateEnvironmentVariables };
