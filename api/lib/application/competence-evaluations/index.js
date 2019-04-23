const competenceEvaluationController = require('./competence-evaluation-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/competence-evaluations',
      config: {
        handler: competenceEvaluationController.start,
        notes: [
          '- **Route nécessitant une authentification**\n' +
          '- S\'il existe déjà une évaluation de competences pour l\'utilisateur courant, alors cette route renvoie l\'évaluation de competences existante avec un code 200\n' +
          '- Sinon, crée une évaluation de competences pour l\'utilisateur courant, et la renvoie avec un code 201\n'
        ],
        tags: ['api', 'competence-evaluations']
      }
    }
  ]);
};

exports.name = 'competence-evaluations-api';
