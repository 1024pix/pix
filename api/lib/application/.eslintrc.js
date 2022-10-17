module.exports = {
  extends: '../.eslintrc.js',
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.name='parseInt']",
        message:
          'parseInt is unnecessary here because Joi already casts string into number if the field is properly described (Joi.number())',
      },
      {
        selector: "CallExpression[callee.object.name='logger']",
        message: 'In HTTP call, use monitoringTools.log<LEVEL>WithCorrelationId instead of logger (ADR37)',
      },
    ],
  },
};
