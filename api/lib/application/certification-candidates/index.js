const certificationCandidateController = require('./certification-candidates-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/certification-candidates/{id}',
      config: {
        handler: certificationCandidateController.get,
        tags: ['api', 'certificationCandidates'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés et autorisés à récupérer ces informations**\n' +
          '- Elle permet de récupérer un candidat de certification par son id',
        ]
      }
    },
    {
      method: 'POST',
      path: '/api/certification-candidates',
      config: {
        handler: certificationCandidateController.save,
        tags: ['api', 'certificationCandidates'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Elle permet de créer un candidat de certification à une session',
        ]
      }
    },
    {
      method: 'DELETE',
      path: '/api/certification-candidates/{id}',
      config: {
        handler: certificationCandidateController.delete,
        tags: ['api', 'certificationCandidates'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés et autorisés à récupérer ces informations**\n' +
          '- Elle permet supprimer un candidat inscrit à une session sous les conditions suivantes :\n' +
          '\t\t- La demande de suppression est au maximum réalisée la veille de la session de certification',
        ]
      }
    },
  ]);
};

exports.name = 'certification-candidates-api';
