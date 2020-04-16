const userTutorialsController = require('./user-tutorials-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'PUT',
      path: '/api/users/tutorials/{tutorialId}',
      config: {
        handler: userTutorialsController.add,
        tags: ['api', 'tutorials'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Enregistrement d‘un tutoriel par l‘utilisateur courant\n' +
          '- L’id du tutoriel doit faire référence à un tutoriel existant',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/users/tutorials',
      config: {
        handler: userTutorialsController.find,
        tags: ['api', 'tutorials'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des tutoriels enregistrés par l‘utilisateur courant\n'
        ],
      },
    },
    {
      method: 'DELETE',
      path: '/api/users/tutorials/{tutorialId}',
      config: {
        handler: userTutorialsController.removeFromUser,
        tags: ['api', 'tutorials'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Suppression d‘un tutoriel de la liste des tutoriels enregistrés par l‘utilisateur courant\n' +
          ' - L‘id du tutoriel doit faire référence à un tutoriel existant',
        ],
      }
    },
  ]);
};

exports.name = 'tutorials-api';
