const SkillReviewController = require('./skill-review-controller');
exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/api/skill-reviews/{id}',
      config: {
        handler: SkillReviewController.get,
        tags: ['api'],
        notes: [
          'Cette route renvoie une évaluation des acquis utilisateur basée sur un profil cible'
        ]
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'skill-reviews-api',
  version: '1.0.0'
};
