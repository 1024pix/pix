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
          '- Cette route permet de répondre à l\'invitation de rejoindre une organisation, via un **code**, un **status** et un **email**'
        ],
        tags: ['api', 'invitations']
      }
    },
    {
      method: 'POST',
      path: '/api/organization-invitations/sco',
      config: {
        auth: false,
        handler: organizationInvitationController.sendScoInvitation,
        notes: [
          '- Cette route permet d\'envoyer une invitation pour rejoindre une organisation de type SCO en tant que ADMIN, en renseignant un **UAI**, un **NOM** et un **PRENOM**'
        ],
        tags: ['api', 'invitations', 'SCO']
      }
    },
    {
      method: 'GET',
      path: '/api/organization-invitations/{id}',
      config: {
        auth: false,
        handler: organizationInvitationController.getOrganizationInvitation,
        notes: [
          '- Cette route permet de récupérer les détails d\'une invitation selon un **id d\'invitation** et un **code**\n',
        ],
        tags: ['api', 'invitations']
      }
    },

  ]);
};

exports.name = 'organization-invitation-api';
