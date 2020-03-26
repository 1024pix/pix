const tutorialsController = require('./tutorials-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'PUT',
      path: '/api/users/me/tutorials/{tutorialId}',
      config: {
        handler: tutorialsController.addToUser,
        tags: ['api'],
      },
    }
  ]);
};

exports.name = 'tutorials-api';
