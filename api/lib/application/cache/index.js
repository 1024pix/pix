const CacheController = require('./cache-controller');

exports.register = function(server, options, next) {

  server.route([{
    method: 'DELETE',
    path: '/api/cache',
    config: { handler: CacheController.removeCacheEntry, tags: ['api'] }
  }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'cache-api',
  version: '1.0.0'
};
