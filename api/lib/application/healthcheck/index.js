const healthcheckController = require('./healthcheck-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/api',
      config: {
        auth: false,
        handler: healthcheckController.get,
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/healthcheck/db',
      config: {
        auth: false,
        handler: healthcheckController.getDbStatus,
        tags: ['api'] }
    },
    {
      method: 'GET',
      path: '/api/healthcheck/crash',
      config: {
        auth: false,
        handler: healthcheckController.crashTest,
        tags: ['api'] }
    },
  ]);

  return next();
};

exports.register.attributes = {
  name: 'healthcheck-api',
  version: '1.0.0'
};
