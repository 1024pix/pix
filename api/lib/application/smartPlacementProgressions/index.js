const SmartPlacementProgressionController = require('./smart-placement-progression-controller');
exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/smart-placement-progressions/{id}',
      config: {
        handler: SmartPlacementProgressionController.get,
        tags: ['api'],
        notes: [
          '- **Route nécessitant une authentification**\n' +
          '- Cette route renvoie une évaluation des acquis utilisateur basée sur un profil cible'
        ]
      }
    }
  ]);
};

exports.name = 'smart-placement-progressions-api';
