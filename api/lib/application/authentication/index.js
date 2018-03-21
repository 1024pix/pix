const AuthenticationController = require('./authentication-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/authentications',
      config: {
        auth: false,
        handler: AuthenticationController.save,
        tags: ['api']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'authentication-api',
  version: '1.0.0'
};
