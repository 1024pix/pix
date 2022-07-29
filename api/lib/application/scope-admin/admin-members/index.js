const adminMemberController = require('./controller');
const securityPreHandlers = require('../../security-pre-handlers');

exports.register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/admin-members',
      config: {
        pre: [{ method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin }],
        handler: adminMemberController.addAdminRole,
        notes: [
          "- Cette route est restreinte aux utilisateurs ayant les droits d'accès\n" +
            '- Elle permet de donner un accès à Pix Admin à un nouveau membre\n' +
            'ou à réactiver un membre désactivé',
        ],
        tags: ['api', 'admin', 'admin-members'],
      },
    },
  ]);
};

exports.name = 'scope-admin-members-api';
