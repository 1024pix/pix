const answerController = require('./answer-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/answers',
      config: {
        auth: false,
        handler: answerController.save,
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/answers/{id}',
      config: {
        auth: false,
        handler: answerController.get,
        tags: ['api']
      }
    },
    {
      method: 'PATCH',
      path: '/api/answers/{id}',
      config: {
        auth: false,
        handler: answerController.update,
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/answers',
      config: {
        auth: false,
        handler: answerController.findByChallengeAndAssessment,
        tags: ['api']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'answers-api',
  version: '1.0.0'
};
