const errorController = require('./error-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/errors/500',
      config: { handler: errorController.simulateInternalError, tags: ['api'] }
    },
  ]);

  return next();
};

exports.register.attributes = {
  name: 'simulate-errors-api',
  version: '1.0.0'
};

