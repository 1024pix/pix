import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { moduleMetadataController } from './module-metadata-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/modules-metadata',
      config: {
        handler: (request, h) => moduleMetadataController.getAllModulesMetadata(request, h),
        notes: ['- Permet de récupérer la liste des métadonnées des modules dans Pix Admin'],
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
          },
        ],
        tags: ['api', 'admin', 'modules-metadata'],
      },
    },
  ]);
};

export const moduleMetadataRoute = { name: 'devcomp/modules-metadata-api', register };
