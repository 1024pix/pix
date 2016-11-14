const CourseController = require('./course-controller');

exports.register = function (server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/api/courses',
      config: { handler: CourseController.list, tags: ['api'] }
    },
    {
      method: 'GET',
      path: '/api/courses/{id}',
      config: { handler: CourseController.get, tags: ['api'] }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'courses-api',
  version: '1.0.0'
};
