const solutionsController = require('./solutions-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/api/solutions',
      config: {
        auth: false,
        handler: solutionsController.find,
        tags: ['api']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'solutions-api',
  version: '1.0.0'
};
