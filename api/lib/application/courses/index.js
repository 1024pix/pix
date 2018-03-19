const courseController = require('./course-controller');
const securityController = require('../../interfaces/controllers/security-controller');
const accessSessionHandler = require('../../application/preHandlers/access-session');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/api/courses',
      config: {
        auth: false,
        handler: courseController.list,
        tags: ['api']
      }
    },
    {
      method: 'PUT',
      path: '/api/courses',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: courseController.refreshAll, tags: ['api']
      }
    }, {
      method: 'GET',
      path: '/api/courses/{id}',
      config: {
        auth: false,
        handler: courseController.get,
        tags: ['api']
      }
    }, {
      method: 'POST',
      path: '/api/courses/{id}',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: courseController.refresh, tags: ['api']
      }
    }, {
      method: 'POST',
      path: '/api/courses',
      config: {
        pre: [{
          method: accessSessionHandler.sessionIsOpened,
          assign: 'sessionOpened'
        }],
        handler: courseController.save,
        tags: ['api']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'courses-api',
  version: '1.0.0'
};
