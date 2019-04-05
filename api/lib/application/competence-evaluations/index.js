const competenceEvaluationController = require('./competence-evaluation-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/competence-evaluations',
      config: {
        handler: competenceEvaluationController.start,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Création d‘une nouvelle évaluation de compétence'
        ],
        tags: ['api', 'competence-evaluations']
      }
    }
  ]);
};

exports.name = 'competence-evaluations-api';
