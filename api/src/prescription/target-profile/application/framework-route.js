import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import * as frameworkController from './framework-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/frameworks',
      config: {
        handler: frameworkController.list,
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
          },
        ],
        tags: ['api', 'admin', 'framework'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin, Support et Métier',
          'Elle permet de récupérer la liste des référentiels disponibles',
        ],
      },
    },
  ]);
};

const name = 'prescription-frameworks-api';
export { name, register };
