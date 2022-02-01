const Joi = require('joi');

module.exports = Joi.object({
  code: Joi.string().required().description('An application-specific error code.'),
  title: Joi.string().required().description('A short, human-readable summary of the problem'),
  status: Joi.string().required().description('the HTTP status code applicable of the problem'),
  detail: Joi.string().required().description('a human-readable explanation specific of the problem'),
}).label('Response-Error-Object');
