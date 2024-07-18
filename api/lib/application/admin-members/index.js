import Joi from 'joi';

import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';
import { adminMemberController } from './admin-member-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/admin/admin-members/{id}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.adminMemberId,
          }),
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                role: Joi.string().valid('SUPER_ADMIN', 'SUPPORT', 'METIER', 'CERTIF'),
              }),
            }),
          }),
          options: {
            allowUnknown: true,
          },
        },
        handler: adminMemberController.updateAdminMember,
        notes: [
          "- Cette route est restreinte aux utilisateurs ayant le droit d'accès SUPER_ADMIN\n" +
            "- Elle permet de changer le rôle d'un membre Pix Admin",
        ],
        tags: ['api', 'admin-members'],
      },
    },
    {
      method: 'PUT',
      path: '/api/admin/admin-members/{id}/deactivate',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.adminMemberId,
          }),
        },
        handler: adminMemberController.deactivateAdminMember,
        notes: [
          "- Cette route est restreinte aux utilisateurs ayant le droit d'accès SUPER_ADMIN\n" +
            '- Elle permet de désactiver un membre Pix Admin',
        ],
        tags: ['api', 'admin-members', 'deactivate'],
      },
    },
  ]);
};

const name = 'admin-members-api';
export { name, register };
