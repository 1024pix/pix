const securityController = require('../../interfaces/controllers/security-controller');
const feedbackController = require('./feedback-controller');

exports.register = (server, options, next) => {

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

  return next();
};

exports.register.attributes = {
  name: 'feedbacks-api',
  version: '1.0.0'
};
