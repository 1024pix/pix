import securityPreHandlers from '../security-pre-handlers';
import LcmsController from './lcms-controller';

export const register = async function (server) {
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
        handler: LcmsController.createRelease,
        tags: ['api', 'lcms'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          'Elle permet de demander la création d’une nouvelle version au référentiel et de recharger le cache',
        ],
      },
    },
  ]);
};

export const name = 'lcms-api';
