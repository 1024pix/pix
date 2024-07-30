import Joi from 'joi';

import { BadRequestError, sendJsonApiError } from '../../../shared/application/http-errors.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { tokenController } from './token.controller.js';

export const tokenRoutes = [
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
          }),
        ),
      },
      pre: [{ method: securityPreHandlers.checkIfUserIsBlocked }],
      handler: (request, h) => tokenController.createToken(request, h),
      tags: ['identity-access-management', 'api', 'token'],
      notes: [
        "Cette route permet d'obtenir un refresh token et access token à partir d'un couple identifiant / mot de passe" +
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
