const SkillReviewController = require('./skill-review-controller');
exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/skill-reviews/{id}',
      config: {
        handler: SkillReviewController.get,
        tags: ['api'],
        notes: [
          '- **Route nécessitant une authentification**\n' +
          '- Cette route renvoie une évaluation des acquis utilisateur basée sur un profil cible'
        ]
      }
    }
  ]);
};

exports.name = 'skill-reviews-api';
