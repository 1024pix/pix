const securityPreHandlers = require('../security-pre-handlers');
const CacheController = require('./cache-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/cache/{model}/{id}',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        handler: CacheController.refreshCacheEntry,
        tags: ['api', 'cache'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master',
          'Elle permet de mettre à jour une entrée du cache de l’application\n' +
          'Attention : pour un état cohérent des objets stockés en cache, utiliser PATCH /api/cache',
        ],
      },
    }, {
      method: 'PATCH',
      path: '/api/cache',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        handler: CacheController.refreshCacheEntries,
        tags: ['api', 'cache'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master',
          'Elle permet de précharger les entrées du cache de l’application (les requêtes les plus longues)',
        ],
      },
    },
  ]);
};

exports.name = 'cache-api';
