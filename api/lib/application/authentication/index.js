import Joi from 'joi';
import { sendJsonApiError, BadRequestError } from '../http-errors.js';
import { authenticationController as AuthenticationController } from './authentication-controller.js';
import { responseAuthenticationDoc } from '../../infrastructure/open-api-doc/authentication/response-authentication-doc.js';
import { responseObjectErrorDoc } from '../../infrastructure/open-api-doc/livret-scolaire/response-object-error-doc.js';

const register = async function (server) {
  server.route([
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
            200: responseAuthenticationDoc,
            401: responseObjectErrorDoc,
            403: responseObjectErrorDoc,
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
              h,
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
  ]);
};

const name = 'authentication-api-old';
export { register, name };
