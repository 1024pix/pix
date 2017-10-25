const organisationController = require('./organization-controller');
const snapshotsAuthorization = require('../../application/preHandlers/snapshot-authorization');

exports.register = function(server, options, next) {
  server.route([
    {
      method: 'POST',
      path: '/api/organizations',
      config: { handler: organisationController.create, tags: ['api'] }
    },
    {
      method: 'GET',
      path: '/api/organizations',
      config: { handler: organisationController.search, tags: ['api'] }
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/snapshots',
      config: { handler: organisationController.getSharedProfiles, tags: ['api'] }
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/snapshots/export',
      config: {
        pre: [{
          method: snapshotsAuthorization.verify,
          assign: 'authorizationCheck'
        }],
        handler: organisationController.exportedSharedSnapshots, tags: ['api']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'organization-api',
  version: '1.0.0'
};
