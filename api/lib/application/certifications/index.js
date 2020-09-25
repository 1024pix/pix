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
          '- Récupération des informations d’une certification de l’utilisateur courant',
        ],
        tags: ['api', 'certifications'],
      },
    },
    {
      method: 'POST',
      path: '/api/shared-certifications',
      config: {
        auth: false,
        handler: certificationController.getCertificationByVerificationCode,
        notes: [
          '- **Route accessible par n\'importe qui**\n' +
          '- Récupération des informations d’une certification d’un utilisateur' +
          ' via un PixScore et un code de vérification',
        ],
        tags: ['api', 'certifications', 'shared-certifications'],
      },
    },
    {
      method: 'GET',
      path: '/api/attestation/{id}',
      config: {
        handler: certificationController.getPDFAttestation,
        notes: [
          '- **Route accessible par un user authentifié**\n' +
          '- Récupération des informations d’une attestation de certification au format PDF' +
          ' via un id de certification et un user id',
        ],
        tags: ['api', 'certifications', 'PDF'],
      },
    },
  ]);
};

exports.name = 'certifications-api';
