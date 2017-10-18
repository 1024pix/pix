const passwordController = require('./password-controller');
const Joi = require('joi');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/password-reset-demands',
      config: {
        handler: passwordController.createResetDemand,
        validate: {
          payload: Joi.object().required().keys({
            data: Joi.object().required().keys({
              attributes: Joi.object().required().keys({
                email: Joi.string().email().required(),
                'temporary-key': [Joi.string(), null]
              }),
              type: Joi.string()
            })
          })
        },
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/password-reset-demands/{temporaryKey}',
      config: {
        handler: passwordController.checkResetDemand, tags: ['api']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'passwords-api',
  version: '1.0.0'
};
