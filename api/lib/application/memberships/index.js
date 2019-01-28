const securityController = require('../../interfaces/controllers/security-controller');
const membershipController = require('./membership-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/memberships',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: membershipController.create,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de donner l’accès à une organisation, avec un rôle particulier pour un utilisateur donné'
        ],
        tags: ['api', 'memberships']
      }
    },
  ]);
};

exports.name = 'memberships-api';
