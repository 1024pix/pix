import Joi from 'joi';

import { oauthController } from './oauth.controller.js';

export const oauthRoutes = [
  {
    method: 'GET',
    path: '/api/oauth/authorize',
    config: {
      auth: false,
      validate: {
        query: Joi.object({
          response_type: Joi.string().required(),
          client_id: Joi.string().required(),
          redirect_uri: Joi.string().required(),
          scope: Joi.string(),
          state: Joi.string().required(),
          code_challenge: Joi.string().required(),
          code_challenge_method: Joi.string().required(),
        }),
      },
      notes: ["- **API pour valider l'identitée de l'application cliente"],
      handler: oauthController.authorize,
      tags: ['api', 'authorization-server'],
    },
  },
  {
    method: 'POST',
    path: '/api/oauth/authorize',
    config: {
      auth: false,
      validate: {
        payload: Joi.object({
          client_id: Joi.string().required(),
          redirect_uri: Joi.string().required(),
          scope: Joi.string().optional(),
          state: Joi.string().required(),
          code_challenge: Joi.string().required(),
          code_challenge_method: Joi.string().required(),
          credentials: Joi.alternatives().try(
            Joi.object({
              username: Joi.string().required(),
              password: Joi.string().required(),
            }),
            Joi.object({
              identity_provider: Joi.string().required(),
              code: Joi.string().required(),
              state: Joi.string().required(),
              iss: Joi.string().optional(),
            }),
          ),
        }),
      },
      handler: oauthController.generateAuthorizationCode,
      notes: ["- **API génère un authorisation code l'utilisateur authentifié pour l'application cliente"],
      tags: ['api', 'authorization-server'],
    },
  },
];
