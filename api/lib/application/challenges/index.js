const ChallengeController = require('./challenge-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/challenges/{id}',
      config: {
        auth: false,
        handler: ChallengeController.get,
        tags: ['api'],
      },
    },
  ]);
};

exports.name = 'challenges-api';
