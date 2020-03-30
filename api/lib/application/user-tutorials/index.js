const userTutorialsController = require('./user-tutorials-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'PUT',
      path: '/api/users/me/tutorials/{tutorialId}',
      config: {
        handler: userTutorialsController.addToUser,
        tags: ['api'],
      },
    },
  ]);
};

exports.name = 'tutorials-api';
