const Joi = require('joi');
const JSONAPIError = require('jsonapi-serializer').Error;
const AuthenticationController = require('./authentication-controller');

exports.register = (server, options, next) => {

  server.route([
    {
      method: 'POST',
      path: '/api/authentications',
      config: {
        auth: false,
        handler: AuthenticationController.save,
        tags: ['api']
      }
    },

    {
      method: 'POST',
      path: '/api/token',
      config: {
        auth: false,
        payload: {
          allow: 'application/x-www-form-urlencoded'
        },
        validate: {
          payload: Joi.object().required().keys({
            grant_type: 'password',
            username: Joi.string().email().required(),
            password: Joi.string().required()
          }),
          failAction: (request, reply) => {
            const errorHttpStatusCode = 400;
            const jsonApiError = new JSONAPIError({
              code: errorHttpStatusCode.toString(),
              title: 'Bad request',
              detail: 'The server could not understand the request due to invalid syntax.',
            });
            return reply(jsonApiError).code(errorHttpStatusCode);
          }
        },
        handler: AuthenticationController.authenticateUser,
        tags: ['api']
      }
    },

    /**
     * This endpoint does nothing and exists only because it is required by
     * Ember Simpl Auth addon, for OAuth 2 "Password Grant" strategy.
     */
    {
      method: 'POST',
      path: '/api/revoke',
      config: {
        auth: false,
        payload: {
          allow: 'application/x-www-form-urlencoded'
        },
        validate: {
          payload: Joi.object().required().keys({
            token: Joi.string().required(),
            token_type_hint: 'access_token'
          }),
          failAction: (request, reply) => {
            const errorHttpStatusCode = 400;
            const jsonApiError = new JSONAPIError({
              code: errorHttpStatusCode.toString(),
              title: 'Bad request',
              detail: 'The server could not understand the request due to invalid syntax.',
            });
            return reply(jsonApiError).code(errorHttpStatusCode);
          }
        },
        handler: (request, reply) => reply(),
        tags: ['api']
      }
    },

  ]);

  return next();
};

exports.register.attributes = {
  name: 'authentication-api',
  version: '1.0.0'
};
