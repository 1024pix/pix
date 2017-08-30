const snapshotController = require('./snapshot-controller');
exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/snapshots',
      config: {
        handler: snapshotController.create, tags: ['api']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'snapshots-api',
  version: '1.0.0'
};
