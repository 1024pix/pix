const ProgressionController = require('./progression-controller');
exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/progressions/{id}',
      config: {
        handler: ProgressionController.get,
        tags: ['api'],
        notes: [
          '- **Route nécessitant une authentification**\n' +
          '- Cette route renvoie une évaluation des acquis utilisateur basée sur un profil cible',
        ],
      },
    },
  ]);
};

exports.name = 'progressions-api';
