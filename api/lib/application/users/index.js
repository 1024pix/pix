const UserController = require('./user-controller');

exports.register = function (server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/api/users',
      config: { handler: UserController.list, tags: ['api'] }
    },
    {
      method: 'GET',
      path: '/api/users/{id}',
      config: { handler: UserController.get, tags: ['api'] }
    },
    {
      method: 'POST',
      path: '/api/users',
      config: { handler: UserController.save, tags: ['api'] }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'users-api',
  version: '1.0.0'
};
