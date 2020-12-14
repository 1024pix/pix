const scorecardController = require('./scorecard-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/scorecards/{id}',
      config: {
        handler: scorecardController.getScorecard,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération d\'un niveau par compétences de l\'utilisateur\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/scorecards/{id}/tutorials',
      config: {
        handler: scorecardController.findTutorials,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des tutoriels par compétences de l\'utilisateur dans une scorecard \n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api'],
      },
    },
  ]);
};

exports.name = 'scorecards-api';
