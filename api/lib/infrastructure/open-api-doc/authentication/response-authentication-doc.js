const Joi = require('joi');

module.exports = Joi.object({
  token_type: 'bearer',
  'access_token': Joi.string().required().description('The bearer token.'),
  'client_id': Joi.string().required().description('The client id.'),
}).label('BearerToken');
