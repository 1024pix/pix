const UserController = require('./user-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/users',
      config: {handler: UserController.save, tags: ['api']}
    },
    {
      method: 'GET',
      path: '/api/users',
      config: {handler: UserController.getProfile, tags: ['api']}
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'users-api',
  version: '1.0.0'
};
