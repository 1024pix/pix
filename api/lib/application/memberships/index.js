const securityPreHandlers = require('../security-pre-handlers');
const membershipController = require('./membership-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/memberships',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: membershipController.create,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de donner l’accès à une organisation, avec un rôle particulier pour un utilisateur donné'
        ],
        plugins: {
          'hapi-swagger': {
            payloadType: 'form',
            order: 1
          }
        },
        tags: ['api', 'memberships']
      }
    },
    {
      method: 'PATCH',
      path: '/api/memberships/{id}',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserIsAdminInOrganization,
          assign: 'isAdminInOrganization'
        }],
        handler: membershipController.update,
        description: 'Update organization role by admin for a organization members',
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés en tant qu\'administrateur de l\'organisation**\n' +
          '- Elle permet de modifier le rôle d\'un membre de l\'organisation'
        ],
        plugins: {
          'hapi-swagger': {
            payloadType: 'form',
            order: 2
          }
        },
        tags: ['api','memberships'],
      }
    }
  ]);
};

exports.name = 'memberships-api';
