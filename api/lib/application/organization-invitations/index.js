const Joi = require('@hapi/joi');
const organizationInvitationController = require('./organization-invitation-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/organization-invitations/{id}/response',
      config: {
        auth: false,
        handler: organizationInvitationController.acceptOrganizationInvitation,
        validate: {
          payload: Joi.object({
            data: {
              id: Joi.string().required(),
              type: Joi.string().required(),
              attributes: {
                code: Joi.string().required(),
                email: Joi.string().email().required(),
              },
            },
          }),
        },
        notes: [
          '- Cette route permet d\'accepter l\'invitation à rejoindre une organisation, via un **code** et un **email**',
        ],
        tags: ['api', 'invitations'],
      },
    },
    {
      method: 'POST',
      path: '/api/organization-invitations/sco',
      config: {
        auth: false,
        handler: organizationInvitationController.sendScoInvitation,
        validate: {
          payload:
            Joi.object({
              data: {
                attributes: {
                  'uai': Joi.string().required(),
                  'first-name': Joi.string().required(),
                  'last-name': Joi.string().required(),
                },
                type: 'sco-organization-invitations',
              },
            }),
        },
        notes: [
          '- Cette route permet d\'envoyer une invitation pour rejoindre une organisation de type SCO en tant que ADMIN, en renseignant un **UAI**, un **NOM** et un **PRENOM**',
        ],
        tags: ['api', 'invitations', 'SCO'],
      },
    },
    {
      method: 'GET',
      path: '/api/organization-invitations/{id}',
      config: {
        auth: false,
        handler: organizationInvitationController.getOrganizationInvitation,
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
          query: Joi.object({
            code: Joi.string().required(),
          }),
        },
        notes: [
          '- Cette route permet de récupérer les détails d\'une invitation selon un **id d\'invitation** et un **code**\n',
        ],
        tags: ['api', 'invitations'],
      },
    },

  ]);
};

exports.name = 'organization-invitation-api';
