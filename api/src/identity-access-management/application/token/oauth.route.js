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
          redirect_uri: Joi.string()
            // .uri({ scheme: ['http', 'https'] })
            .required(),
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
          username: Joi.string().required(),
          password: Joi.string().required(),
          client_id: Joi.string().required(),
          redirect_uri: Joi.string()
            // .uri({ scheme: ['http', 'https'] })
            .required(),
          scope: Joi.string(),
          state: Joi.string().required(),
          code_challenge: Joi.string().required(),
          code_challenge_method: Joi.string().required(),
        }),
      },
      notes: ["- **API génère un authorisation code l'utilisateur authentifié pour l'application cliente"],
      handler: oauthController.generateAuthorizationCode,
      tags: ['api', 'authorization-server'],
    },
  },
];
