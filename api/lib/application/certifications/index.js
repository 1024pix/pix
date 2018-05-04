const certificationController = require('./certification-controller');
const securityController = require('../../interfaces/controllers/security-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/api/certifications',
      config: {
        handler: certificationController.findUserCertifications,
        tags: ['api']
      }
    },
    {
      method: 'PATCH',
      path: '/api/certifications/{id}',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: certificationController.updateCertification,
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
