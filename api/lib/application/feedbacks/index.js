const FeedbackController = require('./feedback-controller');

exports.register = function (server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/feedbacks',
      config: { handler: FeedbackController.save, tags: ['api'] }
    }

  ]);

  return next();
};

exports.register.attributes = {
  name: 'feedbacks-api',
  version: '1.0.0'
};
