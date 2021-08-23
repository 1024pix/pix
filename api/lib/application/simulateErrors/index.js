const errorController = require('./error-controller');

exports.register = function(server) {
  server.route([
    {
      method: 'GET',
      path: '/errors/500',
      config: {
        auth: false,
        handler: errorController.simulateInternalError,
      },
    },
  ]);
};

exports.name = 'simulate-errors-api';

