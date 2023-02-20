import certificationCenterMembershipController from './certification-center-membership-controller';
import securityPreHandlers from '../security-pre-handlers';

export const register = async function (server) {
  const adminRoutes = [
    {
      method: 'DELETE',
      path: '/api/admin/certification-center-memberships/{id}',
      config: {
        handler: certificationCenterMembershipController.disable,
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
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
  ];

  server.route([...adminRoutes]);
};

export const name = 'certification-center-memberships-api';
