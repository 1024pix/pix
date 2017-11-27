const certificationCourseController = require('./certification-course-controller');
const connectedUserVerification = require('../../application/preHandlers/connected-user-verification');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/certification-courses',
      config: {
        pre: [{
          method: connectedUserVerification.verifyByToken,
          assign: 'userId'
        }],
        handler: certificationCourseController.save,
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
