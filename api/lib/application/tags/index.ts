import { Server } from "@hapi/hapi";
const securityPreHandlers = require('../security-pre-handlers');
const { tagController } = require('./tag-controller');
const Joi = require('joi');

exports.register = async (server: Server) => {
  server.bind(tagController);
  server.route([
    {
      method: 'POST',
      path: '/api/admin/tags',
      options: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
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
          '- **Cette route est restreinte aux utilisateurs authentifiés ayant le role Super Admin**\n' +
            '- Elle permet de créer un tag',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/tags',
      options: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: tagController.findAllTags,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Renvoie tous les tags.',
        ],
        tags: ['api', 'tags'],
      },
    },
  ]);
};

exports.name = 'tags-api';
