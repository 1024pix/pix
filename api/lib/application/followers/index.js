const FollowerController = require('./follower-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/followers',
      config: { handler: FollowerController.save, tags: ['api'] }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'followers-api',
  version: '1.0.0'
};
