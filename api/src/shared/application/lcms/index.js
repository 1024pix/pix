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
    {
      method: 'PATCH',
      path: '/api/cache/{model}/{id}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        handler: lcmsController.refreshCacheEntry,
        tags: ['api', 'cache'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          'Elle permet de mettre à jour une entrée du cache de l’application\n' +
            'Attention : pour un état cohérent des objets stockés en cache, utiliser PATCH /api/cache',
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/cache',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        handler: lcmsController.refreshCacheEntries,
        tags: ['api', 'cache'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          'Elle permet de précharger les entrées du cache de l’application (les requêtes les plus longues)',
        ],
      },
    },
  ]);
};

const name = 'lcms-api';
export { name, register };
