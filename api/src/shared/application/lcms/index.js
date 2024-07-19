import { securityPreHandlers } from '../security-pre-handlers.js';
import { lcmsController } from './lcms-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/lcms/releases',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        handler: lcmsController.createRelease,
        tags: ['api', 'lcms'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          'Elle permet de demander la création d’une nouvelle version au référentiel et de recharger le cache',
        ],
      },
    },
  ]);
};

const name = 'lcms-api';
export { name, register };
