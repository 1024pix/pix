const AnswerController = require('./answer-controller');

exports.register = function (server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/answers',
      config: { handler: AnswerController.save, tags: ['api'] }
    },
    {
      method: 'GET',
      path: '/api/answers/{id}',
      config: { handler: AnswerController.get, tags: ['api'] }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'answers-api',
  version: '1.0.0'
};
