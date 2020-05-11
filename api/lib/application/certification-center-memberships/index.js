const certificationCenterMembershipController = require('./certification-center-membership-controller');
const securityController = require('../security-controller');

exports.register = async function(server) {
  server.route([

    {
      method: 'POST',
      path: '/api/certification-center-memberships',
      config: {
        handler: certificationCenterMembershipController.create,
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        notes: [
          '- **Cette route est restreinte aux utilisateurs Pix Master authentifiés**\n' +
          '- Création d‘un lien entre un utilisateur et un centre de certification\n' +
          '- L‘utilisateur doit avoir les droits d‘accès en tant que Pix Master',
        ],
        tags: ['api', 'certification-center-membership']
      }
    }
  ]);
};

exports.name = 'certification-center-memberships-api';
