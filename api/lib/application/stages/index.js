const securityPreHandlers = require('../security-pre-handlers');
const stagesController = require('./stages-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/stages',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        handler: stagesController.create,
        tags: ['api', 'stages'],
      },
    },
  ]);
};

exports.name = 'badges-api';
