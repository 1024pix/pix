const certificationCenterMembershipController = require('./certification-center-membership-controller');
const securityPreHandlers = require('../security-pre-handlers');

exports.register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/certification-center-memberships',
      config: {
        handler: certificationCenterMembershipController.create,
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.userHasAtLeastOneAccessOf([
                securityPreHandlers.checkUserHasRoleSuperAdmin,
                securityPreHandlers.checkUserHasRoleCertif,
                securityPreHandlers.checkUserHasRoleSupport,
                securityPreHandlers.checkUserHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n" +
            '- Création d‘un lien entre un utilisateur et un centre de certification\n',
        ],
        tags: ['api', 'certification-center-membership'],
      },
    },
    {
      method: 'DELETE',
      path: '/api/certification-center-memberships/{id}',
      config: {
        handler: certificationCenterMembershipController.disable,
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.userHasAtLeastOneAccessOf([
                securityPreHandlers.checkUserHasRoleSuperAdmin,
                securityPreHandlers.checkUserHasRoleCertif,
                securityPreHandlers.checkUserHasRoleSupport,
                securityPreHandlers.checkUserHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n" +
            '- Désactivation d‘un lien entre un utilisateur et un centre de certification\n',
        ],
        tags: ['api', 'certification-center-membership'],
      },
    },
  ]);
};

exports.name = 'certification-center-memberships-api';
