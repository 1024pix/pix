import Joi from 'joi';

import { identifiersType } from '../../domain/types/identifiers-type.js';
import { securityPreHandlers } from '../security-pre-handlers.js';
import { tagController } from './tag-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/tags',
      config: {
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
      config: {
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
    {
      method: 'GET',
      path: '/api/admin/tags/{id}/recently-used',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: tagController.getRecentlyUsedTags,
        validate: {
          params: Joi.object({
            id: identifiersType.tagId,
          }),
        },
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Renvoie les 10 tags les plus utilisés par rapport au tag sélectionné',
        ],
        tags: ['api', 'tags'],
      },
    },
  ]);
};

const name = 'tags-api';
export { name, register };
