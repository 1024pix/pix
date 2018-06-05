const courseController = require('./course-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/api/courses',
      config: {
        auth: false,
        handler: courseController.list,
        tags: ['api']
      }
    }, {
      method: 'GET',
      path: '/api/courses/{id}',
      config: {
        auth: false,
        handler: courseController.get,
        tags: ['api']
      }
    }, {
      method: 'POST',
      path: '/api/courses',
      config: {
        handler: courseController.save,
        tags: ['api']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'courses-api',
  version: '1.0.0'
};
