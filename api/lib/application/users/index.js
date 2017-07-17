const UserController = require('./user-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/users',
      config: { handler: UserController.save, tags: ['api'] }
    },
    {
      method: 'GET',
      path: '/api/users/me',
      config: { handler: UserController.getAuthenticatedUserProfile, tags: ['api'] }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'users-api',
  version: '1.0.0'
};
