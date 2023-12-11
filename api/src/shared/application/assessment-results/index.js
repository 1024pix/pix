import { assessmentResultController } from './assessment-result-controller.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/assessment-results',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: assessmentResultController.save,
        tags: ['api'],
      },
    },
  ]);
};

const name = 'assessments-results-api';
export { register, name };
