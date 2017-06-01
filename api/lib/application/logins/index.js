const LoginController = require('./login-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/logins',
      config: { handler: LoginController.save, tags: ['api'] }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'login-api',
  version: '1.0.0'
};
