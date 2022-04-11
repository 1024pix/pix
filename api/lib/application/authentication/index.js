const Joi = require('joi');
const { sendJsonApiError, BadRequestError } = require('../http-errors');
const AuthenticationController = require('./authentication-controller');
const responseAuthenticationObjectDoc = require('../../infrastructure/open-api-doc/authentication/response-authentication-doc');
const responseErrorObjectDoc = require('../../infrastructure/open-api-doc/livret-scolaire/response-object-error-doc');

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
          payload: Joi.alternatives().try(
            Joi.object().required().keys({
              grant_type: 'password',
              username: Joi.string().required(),
              password: Joi.string().required(),
              scope: Joi.string(),
            }),
            Joi.object().required().keys({
              grant_type: 'refresh_token',
              refresh_token: Joi.string(),
              scope: Joi.string(),
            })
          ),
        },
        handler: AuthenticationController.createToken,
        tags: ['api'],
        notes: [
          "Cette route permet d'obtenir un refresh token et access token à partir d'un couple identifiant / mot de passe" +
            " ou un access token à partir d'un refresh token valide.",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/application/token',
      config: {
        auth: false,
        payload: {
          allow: 'application/x-www-form-urlencoded',
        },
        plugins: {
          'hapi-swagger': {
            payloadType: 'form',
            produces: ['application/json'],
            consumes: ['application/x-www-form-urlencoded'],
          },
        },
        validate: {
          payload: Joi.object()
            .required()
            .keys({
              grant_type: Joi.string()
                .valid('client_credentials')
                .required()
                .description("Grant type should be 'client_credentials'"),
              client_id: Joi.string().required().description('Client identification'),
              client_secret: Joi.string().required().description('Client secret for the corresponding identification'),
              scope: Joi.string().required().description('Scope to access data'),
            })
            .label('AuthorizationPayload'),
        },
        notes: ["- **API pour récupérer le token à partir d'un client ID et client secret**\n"],
        response: {
          failAction: 'log',
          status: {
            200: responseAuthenticationObjectDoc,
            401: responseErrorObjectDoc,
            403: responseErrorObjectDoc,
          },
        },
        handler: AuthenticationController.authenticateApplication,
        tags: ['api', 'authorization-server'],
      },
    },

    {
      method: 'POST',
      path: '/api/token/anonymous',
      config: {
        auth: false,
        payload: {
          allow: 'application/x-www-form-urlencoded',
        },
        validate: {
          payload: Joi.object().required().keys({
            campaign_code: Joi.string().required(),
            lang: Joi.string().required(),
          }),
        },
        handler: AuthenticationController.authenticateAnonymousUser,
        notes: [
          "- Cette route permet de créer un utilisateur à partir d'un code parcours Accès Simplifié\n" +
            "- Elle retournera un access token Pix correspondant à l'utilisateur.",
        ],
        tags: ['api'],
      },
    },
    {
      method: 'POST',
      path: '/api/revoke',
      config: {
        auth: false,
        payload: {
          allow: 'application/x-www-form-urlencoded',
        },
        validate: {
          payload: Joi.object()
            .required()
            .keys({
              token: Joi.string().required(),
              token_type_hint: ['access_token', 'refresh_token'],
            }),
          failAction: (request, h) => {
            return sendJsonApiError(
              new BadRequestError('The server could not understand the request due to invalid token.'),
              h
            );
          },
        },
        handler: AuthenticationController.revokeToken,
        notes: ['- Cette route permet de supprimer le refresh token du temporary storage'],
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
        auth: { mode: 'optional' },
        payload: {
          allow: 'application/x-www-form-urlencoded',
        },
        validate: {
          payload: Joi.object().required().keys({
            code: Joi.string().required(),
            redirect_uri: Joi.string().required(),
            state_sent: Joi.string().required(),
            state_received: Joi.string().required(),
          }),
        },
        handler: AuthenticationController.authenticatePoleEmploiUser,
        notes: [
          "- Cette route permet de récupérer l'ID Token d'un candidat Pole emploi.\n" +
            "- Elle retournera également un access token Pix correspondant à l'utilisateur.",
        ],
        tags: ['api', 'Pôle emploi'],
      },
    },
  ]);
};

exports.name = 'authentication-api';
