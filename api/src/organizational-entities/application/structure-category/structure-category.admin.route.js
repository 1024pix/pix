import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { structureCategoriesController } from './structure-category.admin.controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/structure-categories',
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
        handler: (request, h) => structureCategoriesController.findAllCategories(request, h),
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Renvoie toutes les catégories de structures.',
        ],
        tags: ['api', 'structure-categories'],
      },
    },
  ]);
};

export const structureCategoryAdminRoute = {
  name: 'organizational-entities/structure-category-admin-api',
  register,
};
