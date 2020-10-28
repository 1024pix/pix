const Joi = require('@hapi/joi');
const { sendJsonApiError, BadRequestError } = require('../http-errors');
const AuthenticationController = require('./authentication-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/token',
      config: {
        auth: false,
        payload: {
          allow: 'application/x-www-form-urlencoded',
        },
        validate: {
          payload: Joi.object().required().keys({
            grant_type: 'password',
            username: Joi.string().required(),
            password: Joi.string().required(),
            scope: Joi.string(),
          }),
        },
        handler: AuthenticationController.authenticateUser,
        tags: ['api'],
      },
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
          allow: 'application/x-www-form-urlencoded',
        },
        validate: {
          payload: Joi.object().required().keys({
            token: Joi.string().required(),
            token_type_hint: 'access_token',
          }),
          failAction: (request, h) => {
            return sendJsonApiError(new BadRequestError('The server could not understand the request due to invalid token.'), h);
          },
        },
        handler: (request, h) => h.response(),
        tags: ['api'],
      },
    },
    {
      method: 'POST',
      path: '/api/token-from-external-user',
      config: {
        auth: false,
        validate: {
          payload: Joi.object({
            data: {
              type: Joi.string().valid('external-user-authentication-requests').required(),
              attributes: {
                username: Joi.string().required(),
                password: Joi.string().required(),
                'external-user-token': Joi.string().required(),
                'expected-user-id': Joi.number().positive().required(),
              },
            },
          }),
        },
        handler: AuthenticationController.authenticateExternalUser,
        tags: ['api'],
      },
    },
    {
      method: 'POST',
      path: '/api/pole-emploi/token',
      config: {
        auth: false,
        payload: {
          allow: 'application/x-www-form-urlencoded',
        },
        validate: {
          payload: Joi.object().required().keys({
            code: Joi.string().required(),
            client_id: Joi.string().required(),
            redirect_uri: Joi.string().required(),
          }),
        },
        handler: AuthenticationController.authenticatePoleEmploiUser,
        notes: [
          '- Cette route permet de récupérer l\'ID Token d\'un candidat Pole emploi.\n' +
          '- Elle retournera également un access token Pix correspondant à l\'utilisateur.',
        ],
        tags: ['api', 'Pôle emploi'],
      },
    },
  ]);
};

exports.name = 'authentication-api';
