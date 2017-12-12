const sessionController = require('./session-controller');
exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/api/sessions',
      config: {
        handler: sessionController.get, tags: ['api']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'sessions-api',
  version: '1.0.0'
};
