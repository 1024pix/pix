const securityPreHandlers = require('../security-pre-handlers');
const tagController = require('./tag-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/tags',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        handler: tagController.findAllTags,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Renvoie tous les tags.',
        ],
        tags: ['api', 'tags'],
      },
    },
  ]);
};

exports.name = 'tags-api';
