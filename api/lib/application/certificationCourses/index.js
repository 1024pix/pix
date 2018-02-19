const certificationCourseController = require('./certification-course-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/api/certification-courses/{id}/result/compute',
      config: {
        handler: certificationCourseController.computeResult,
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/certification-courses/{id}/result',
      config: {
        handler: certificationCourseController.getResult,
        tags: ['api']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'certification-courses-api',
  version: '1.0.0'
};
