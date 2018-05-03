const certificationController = require('./certification-controller');
const securityController = require('../../interfaces/controllers/security-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/api/certifications',
      config: {
        handler: certificationController.findUserCertifications,
        notes: [
          '- **Route nécessitant une authentification**\n' +
          '- Récupération de toutes les certifications complétées de l\'utilisateur courant'
        ],
        tags: ['api', 'certifications']
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
        notes: [
          '- **Route nécessitant une authentification**\n' +
          '- Mise à jour d\'une certification'
        ],
        tags: ['api', 'certifications']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'certifications-api',
  version: '1.0.0'
};
