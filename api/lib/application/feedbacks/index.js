const securityController = require('../../interfaces/controllers/security-controller');
const feedbackController = require('./feedback-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/feedbacks',
      config: {
        auth: false,
        handler: feedbackController.save,
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/feedbacks',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: feedbackController.find,
        tags: ['api']
      }
    }

  ]);
};

exports.name = 'feedbacks-api';
