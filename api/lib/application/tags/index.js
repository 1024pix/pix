const securityPreHandlers = require('../security-pre-handlers');
const tagController = require('./tag-controller');
const Joi = require('joi');

exports.register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/tags',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserHasRolePixMaster,
            assign: 'hasRolePixMaster',
          },
        ],
        validate: {
          payload: Joi.object({
            data: {
              type: 'tags',
              attributes: {
                name: Joi.string().required(),
              },
            },
          }),
          options: {
            allowUnknown: true,
          },
        },
        handler: tagController.create,
        tags: ['api', 'tags'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
            '- Elle permet de créer un tag',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/tags',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserHasRolePixMaster,
            assign: 'hasRolePixMaster',
          },
        ],
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
