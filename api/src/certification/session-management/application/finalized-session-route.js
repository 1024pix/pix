import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { finalizedSessionController } from './finalized-session-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/sessions/to-publish',
      config: {
        validate: {
          query: Joi.object({
            filter: {
              version: Joi.number(),
            },
          }),
        },
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: finalizedSessionController.findFinalizedSessionsToPublish,
        tags: ['api', 'finalized-sessions'],
      },
    },
  ]);
};

const name = 'finalized-session-api';
export { name, register };
