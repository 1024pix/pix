const healthcheckController = require('./healthcheck-controller');

exports.register = async function(server) {
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
        handler: healthcheckController.checkDbStatus,
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
};

exports.name = 'healthcheck-api';
