import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { membershipController } from './membership.controller.js';

export const membershipRoutes = [
  {
    method: 'POST',
    path: '/api/admin/memberships',
    config: {
      pre: [
        {
          method: (request, h) =>
            securityPreHandlers.hasAtLeastOneAccessOf([
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
              securityPreHandlers.checkAdminMemberHasRoleSupport,
              securityPreHandlers.checkAdminMemberHasRoleMetier,
            ])(request, h),
          assign: 'hasAuthorizationToAccessAdminScope',
        },
      ],
      handler: (request, h) => membershipController.create(request, h),
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
          '- Elle permet de donner l’accès à une organisation, avec un rôle particulier pour un utilisateur donné',
      ],
      plugins: {
        'hapi-swagger': {
          payloadType: 'form',
          order: 1,
        },
      },
      tags: ['api', 'memberships'],
    },
  },
];
