const feedbackController = require('./feedback-controller');

exports.register = (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/feedbacks',
      config: {
        auth: false,
        handler: feedbackController.save,
        tags: ['api'],
      },
    },
  ]);
};

exports.name = 'feedbacks-api';
