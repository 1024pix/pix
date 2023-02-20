import AssessmentResultController from './assessment-result-controller';
import securityPreHandlers from '../security-pre-handlers';

export const register = async (server) => {
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
        handler: AssessmentResultController.save,
        tags: ['api'],
      },
    },
  ]);
};

export const name = 'assessments-results-api';
