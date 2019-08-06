const answerController = require('./answer-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/answers',
      config: {
        auth: false,
        handler: answerController.save,
        tags: ['api', 'answers'],
        notes: [
          '- **Cette route est accessible à tous, mais vérifie que l\'answer appartient à l\'utilisateur**\n' +
          '- Enregistre une réponse à un challenge',
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/answers/{id}',
      config: {
        auth: false,
        handler: answerController.get,
        tags: ['api', 'answers'],
        notes: [
          '- **Cette route est accessible à tous, mais vérifie que l\'answer appartient à l\'utilisateur**\n' +
          '- Récupère la réponse',
        ]
      }
    },
    {
      method: 'PATCH',
      path: '/api/answers/{id}',
      config: {
        auth: false,
        handler: answerController.update,
        tags: ['api', 'answers'],
        notes: [
          '- **Cette route est accessible à tous, mais vérifie que l\'answer appartient à l\'utilisateur**\n' +
          '- Cette route ne fait rien actuellement',
        ],
      }
    },
    {
      method: 'GET',
      path: '/api/answers',
      config: {
        auth: false,
        handler: answerController.findByChallengeAndAssessment,
        tags: ['api', 'answers'],
        notes: [
          '- **Cette route est accessible à tous, mais vérifie que l\'answer appartient à l\'utilisateur**\n' +
          '- Récupère la liste des réponses par Challenge et Assessment',
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/answers/{id}/correction',
      config: {
        auth: false,
        handler: answerController.getCorrection,
        tags: ['api', 'answers'],
        notes: [
          '- **Cette route est accessible à tous, mais vérifie que l\'answer appartient à l\'utilisateur**\n' +
          '- Récupère la correction à une réponse',
        ]
      }
    },
  ]);
};

exports.name = 'answers-api';
