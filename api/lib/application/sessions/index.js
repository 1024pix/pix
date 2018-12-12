const securityController = require('../../interfaces/controllers/security-controller');
const sessionController = require('./session-controller');

exports.register = (server, options, next) => {

  server.route([
    {
      method: 'GET',
      path: '/api/sessions',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: sessionController.find,
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/sessions/{id}',
      config: {
        auth: false,
        handler: sessionController.get,
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/api/sessions',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: sessionController.save,
        tags: ['api']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'sessions-api',
  version: '1.0.0'
};
