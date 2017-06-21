const CourseGroupController = require('./course-group-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/api/course-groups',
      config: { handler: CourseGroupController.list, tags: ['api'] }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'course-groups-api',
  version: '1.0.0'
};
