const AssessmentResultController = require('./assessment-result-controller');
const securityPreHandlers = require('../security-pre-handlers');

exports.register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/assessment-results',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.userHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkUserHasRoleCertif,
                securityPreHandlers.checkUserHasRoleSupport,
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

exports.name = 'assessments-results-api';
