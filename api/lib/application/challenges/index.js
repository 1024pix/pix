const ChallengeController = require('./challenge-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/api/challenges',
      config: { handler: ChallengeController.list, tags: ['api'] }
    },
    {
      method: 'GET',
      path: '/api/challenges/{id}',
      config: { handler: ChallengeController.get, tags: ['api'] }
    },
    {
      method: 'POST',
      path: '/api/challenges/{id}',
      config: { handler: ChallengeController.refresh, tags: ['api'] }
    },
    {

      method: 'PUT',
      path: '/api/challenges/{id}/validate',
      config: { handler: ChallengeController.revalidateAnswers, tags: ['api'] }
    },
    {
      method: 'POST',
      path: '/api/challenges/{id}/solution',
      config: { handler: ChallengeController.refreshSolution, tags: ['api'] }

    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'challenges-api',
  version: '1.0.0'
};
