const certificationCenterMembershipController = require('./certification-center-membership-controller');
const securityPreHandlers = require('../security-pre-handlers');

exports.register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/certification-center-memberships',
      config: {
        handler: certificationCenterMembershipController.create,
        pre: [
          {
            method: securityPreHandlers.checkUserHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        notes: [
          '- **Cette route est restreinte aux utilisateurs Super Admin authentifiés**\n' +
            '- Création d‘un lien entre un utilisateur et un centre de certification\n' +
            '- L‘utilisateur doit avoir les droits d‘accès en tant que Super Admin',
        ],
        tags: ['api', 'certification-center-membership'],
      },
    },
    {
      method: 'DELETE',
      path: '/api/certification-center-memberships/{id}',
      config: {
        handler: certificationCenterMembershipController.disable,
        pre: [
          {
            method: securityPreHandlers.checkUserHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        notes: [
          '- **Cette route est restreinte aux utilisateurs Super Admin authentifiés**\n' +
            '- Désactivation d‘un lien entre un utilisateur et un centre de certification\n',
        ],
        tags: ['api', 'certification-center-membership'],
      },
    },
  ]);
};

exports.name = 'certification-center-memberships-api';
