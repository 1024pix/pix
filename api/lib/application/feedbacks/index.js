const feedbackController = require('./feedback-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/feedbacks',
      config: { handler: feedbackController.save, tags: ['api'] }
    },
    {
      method: 'GET',
      path: '/api/feedbacks',
      config: { handler: feedbackController.find, tags: ['api'] }
    }

  ]);

  return next();
};

exports.register.attributes = {
  name: 'feedbacks-api',
  version: '1.0.0'
};
