const securityController = require('../../interfaces/controllers/security-controller');
const CacheController = require('./cache-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'DELETE',
      path: '/api/cache/{cachekey}',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: CacheController.removeCacheEntry,
        tags: ['api', 'cache'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master',
          'Elle permet de supprimer une entrée du cache de l’application\n' +
          'Attention : pour un état cohérent des objets stockés en cache, utiliser DELETE /api/cache'
        ]
      }
    },{
      method: 'DELETE',
      path: '/api/cache',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: CacheController.removeAllCacheEntries,
        tags: ['api', 'cache'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master',
          'Elle permet de supprimer toutes les entrées du cache de l’application',
        ]
      }
    },{
      method: 'PATCH',
      path: '/api/cache',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: CacheController.preloadCacheEntries,
        tags: ['api', 'cache'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master',
          'Elle permet de précharger les entrées du cache de l’application (les requêtes les plus longues)',
        ]
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'cache-api',
  version: '1.0.0'
};
