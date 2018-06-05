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
        tags: ['api']
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
        tags: ['api']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'cache-api',
  version: '1.0.0'
};
