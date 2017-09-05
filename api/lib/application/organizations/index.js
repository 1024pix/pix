const organisationController = require('./organization-controller');

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
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'organization-api',
  version: '1.0.0'
};
