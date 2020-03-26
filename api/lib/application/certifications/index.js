const certificationController = require('./certification-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/certifications',
      config: {
        handler: certificationController.findUserCertifications,
        notes: [
          '- **Route nécessitant une authentification**\n' +
          '- Récupération de toutes les certifications complétées de l’utilisateur courant',
        ],
        tags: ['api', 'certifications'],
      },
    },
    {
      method: 'GET',
      path: '/api/certifications/{id}',
      config: {
        handler: certificationController.getCertification,
        notes: [
          '- **Route nécessitant une authentification**\n' +
          '- Seules les certifications de l’utilisateur authentifié sont accessibles\n' +
          '- Récupération des informations d’une certification d’un utilisateur',
        ],
        tags: ['api', 'certifications'],
      },
    },
  ]);
};

exports.name = 'certifications-api';
