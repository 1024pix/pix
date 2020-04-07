const userTutorialsController = require('./user-tutorials-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'PUT',
      path: '/api/users/tutorials/{tutorialId}',
      config: {
        handler: userTutorialsController.add,
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/users/tutorials',
      config: {
        handler: userTutorialsController.find,
        tags: ['api'],
      },
    },
    {
      method: 'DELETE',
      path: '/api/users/tutorials/{tutorialId}',
      config: {
        handler: userTutorialsController.removeFromUser,
        tags: ['api']
      }
    }
  ]);
};

exports.name = 'tutorials-api';
