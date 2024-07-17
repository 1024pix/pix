import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { controller } from './controller.js';

const register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/organizations/{id}/cover-rate',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToOrganization,
          },
        ],
        validate: {
          query: Joi.object({
            filter: Joi.object({}).default({}),
          }).default({}),
        },
        handler: controller.getCoverRate,
        tags: ['api', 'organizations', 'results'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle retourne le taux de couverture de l'organization",
        ],
      },
    },
  ]);
};

const name = 'cover-rate-api';

export { name, register };

const coverRateRoutes = [{ name, register }];
export { coverRateRoutes };
