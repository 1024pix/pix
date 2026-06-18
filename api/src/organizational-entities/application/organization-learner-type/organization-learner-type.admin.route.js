import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { organizationLearnerTypesController } from './organization-learner-type.admin.controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/organization-learner-types',
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
        handler: (request, h) => organizationLearnerTypesController.findAllOrganizationLearnerTypes(request, h),
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Renvoie tous les publics prescrits.',
        ],
        tags: ['api', 'organization-learner-types'],
      },
    },
  ]);
};

export const organizationLearnerTypeAdminRoute = {
  name: 'organizational-entities/organization-learner-type-admin-api',
  register,
};
