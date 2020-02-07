const Joi = require('@hapi/joi');
const JSONAPIError = require('jsonapi-serializer').Error;
const AuthenticationController = require('./authentication-controller');

exports.register = async (server) => {
  server.route([
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
            username: Joi.string().required(),
            password: Joi.string().required(),
            scope: Joi.string(),
          }),
          failAction: (request, h , err) => {
            throw err;
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
          failAction: (request, h) => {
            const errorHttpStatusCode = 400;
            const jsonApiError = new JSONAPIError({
              code: errorHttpStatusCode.toString(),
              title: 'Bad request',
              detail: 'The server could not understand the request due to invalid syntax.',
            });
            return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
          }
        },
        handler: (request, h) => h.response(),
        tags: ['api']
      }
    },

  ]);
};

exports.name = 'authentication-api';
