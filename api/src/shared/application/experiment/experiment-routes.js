import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import * as experimentController from './experiment-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/experiment/trigger',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([securityPreHandlers.checkAdminMemberHasRoleSuperAdmin])(
                request,
                h,
              ),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: experimentController.triggerJobExperiment,
      },
    },
    {
      method: 'GET',
      path: '/api/admin/experiment/monitor',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([securityPreHandlers.checkAdminMemberHasRoleSuperAdmin])(
                request,
                h,
              ),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: experimentController.monitorJobExperiment,
      },
    },
  ]);
};

export const experimentRoute = { name: 'shared/experiment-api', register };
