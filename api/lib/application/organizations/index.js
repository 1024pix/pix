const organisationController = require('./organization-controller');

exports.register = function(server, options, next) {
  server.route([
    {
      method: 'POST',
      path: '/api/organizations',
      config: { handler: organisationController.create, tags: ['api'] }
    },
  ]);

  return next();
};

exports.register.attributes = {
  name: 'organization-api',
  version: '1.0.0'
};
