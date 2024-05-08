import Joi from 'joi';

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
      tags: ['api', 'authentication', 'token'],
      notes: [
        "Cette route permet d'obtenir un refresh token et access token à partir d'un couple identifiant / mot de passe" +
          " ou un access token à partir d'un refresh token valide.",
      ],
    },
  },
];
