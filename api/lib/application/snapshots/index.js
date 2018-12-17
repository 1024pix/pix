const snapshotController = require('./snapshot-controller');
exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/snapshots',
      config: {
        handler: snapshotController.create, tags: ['api']
      }
    }
  ]);
};

exports.name = 'snapshots-api';
