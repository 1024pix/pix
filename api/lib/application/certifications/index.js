const certificationController = require('./certification-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/api/certifications',
      config: {
        handler: certificationController.findUserCertifications,
        tags: ['api']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'certifications-api',
  version: '1.0.0'
};
