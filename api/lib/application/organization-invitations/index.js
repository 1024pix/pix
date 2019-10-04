const organizationInvitationController = require('./organization-invitation-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/organization-invitations/{id}/response',
      config: {
        auth: false,
        handler: organizationInvitationController.answerToOrganizationInvitation,
        notes: [
          '- **Cette route permet de répondre à l\'invitation de rejoindre une organisation, via une **temporaryKey** et un **status**'
        ],
        tags: ['api', 'invitations']
      }
    },

  ]);
};

exports.name = 'organization-invitation-api';
