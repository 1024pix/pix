const tutorialEvaluationsController = require('./tutorial-evaluations-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'PUT',
      path: '/api/users/tutorials/{tutorialId}/evaluate',
      config: {
        handler: tutorialEvaluationsController.evaluate,
        tags: ['api', 'tutorials'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Appréciation d‘un tutoriel par l‘utilisateur courant\n' +
          '- L’id du tutoriel doit faire référence à un tutoriel existant',
        ],
      },
    }
  ]);
};

exports.name = 'tutorial-evaluations-api';
