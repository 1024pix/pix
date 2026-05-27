import Joi from 'joi';

import { BadRequestError, sendJsonApiError } from '../../../shared/application/errors/http-errors.js';
import { responseAuthenticationDoc } from '../../../shared/infrastructure/open-api-doc/authentication/response-authentication-doc.js';
import { responseObjectErrorDoc } from '../../../shared/infrastructure/open-api-doc/response-object-error-doc.js';
import { checkIfUserIsBlocked } from '../security-pre-handlers.js';
import { tokenController } from './token.controller.js';

export const tokenRoutes = [
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
      handler: tokenController.authenticateApplication,
      tags: ['api', 'authorization-server', 'parcoursup', 'maddo'],
    },
  },
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
          Joi.object()
            .required()
            .keys({
              grant_type: Joi.string().valid('password').required(),
              username: Joi.string().required(),
              password: Joi.string().required(),
            }),
          Joi.object()
            .required()
            .keys({
              grant_type: Joi.string().valid('refresh_token').required(),
              refresh_token: Joi.string(),
            }),
        ),
      },
      pre: [{ method: checkIfUserIsBlocked }],
      handler: (request, h) => tokenController.createToken(request, h),
      tags: ['identity-access-management', 'api', 'token'],
      notes: [
        "Cette route permet d'obtenir un access token et un refresh token à partir d'un couple identifiant / mot de passe" +
          " ou un access token à partir d'un refresh token valide.",
      ],
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
      handler: (request, h) => tokenController.authenticateAnonymousUser(request, h),
      notes: [
        "- Cette route permet de créer un utilisateur à partir d'un code parcours Accès Simplifié\n" +
          "- Elle retournera un access token Pix correspondant à l'utilisateur.",
      ],
      tags: ['identity-access-management', 'api', 'token'],
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
      handler: (request, h) => tokenController.revokeToken(request, h),
      notes: ['- Cette route permet de supprimer le refresh token du temporary storage'],
      tags: ['identity-access-management', 'api', 'token'],
    },
  },
];
