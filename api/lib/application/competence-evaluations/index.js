const competenceEvaluationController = require('./competence-evaluation-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/competence-evaluations/start-or-resume',
      config: {
        handler: competenceEvaluationController.startOrResume,
        notes: [
          '- **Route nécessitant une authentification**\n' +
          '- S\'il existe déjà une évaluation de competences pour l\'utilisateur courant, alors cette route renvoie l\'évaluation de competence existante avec un code 200\n' +
          '- Sinon, crée une évaluation de competences pour l\'utilisateur courant, et la renvoie avec un code 201\n',
        ],
        tags: ['api', 'competence-evaluations'],
      },
    },
    {
      method: 'POST',
      path: '/api/competence-evaluations/improve',
      config: {
        handler: competenceEvaluationController.improve,
        notes: [
          '- **Route nécessitant une authentification**\n' +
          '- Cette route renvoie l\'évaluation de competences existante avec un code 200\n',
        ],
        tags: ['api', 'competence-evaluations'],
      },
    },
    {
      /**
       * @deprecated Method that should be deleted at some point, when replacement working.
       * Replacement in assessment-controller::findCompetenceEvaluations
       */
      method: 'GET',
      path: '/api/competence-evaluations',
      config: {
        handler: competenceEvaluationController.find,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des competence-evaluations par assessment',
        ],
        tags: ['api', 'competence-evaluations'],
      },
    },
  ]);
};

exports.name = 'competence-evaluations-api';
