const snapshotController = require('./snapshot-controller');
const snapshotsAuthorization = require('../../application/preHandlers/snapshot-authorization');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/snapshots',
      config: {
        handler: snapshotController.find,
        pre: [{
          method: snapshotsAuthorization.verify,
          assign: 'authorizationCheck'
        }],
        tags: ['api', 'snapshots'],
      },
    },
  ]);
};

exports.name = 'snapshots-api';
