import Joi from 'joi';

import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';
import { adminMemberController as srcAdminMemberController } from '../../../src/team/application/admin-member/admin-member.controller.js';
import { adminMemberController } from './admin-member-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/admin-members',
      config: {
        handler: adminMemberController.findAll,
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant le droit d'accès SUPER_ADMIN**\n" +
            '- Lister les utilisateurs ayant accès à Pix Admin \n',
        ],
        tags: ['api', 'admin-members'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/admin-members/me',
      config: {
        handler: adminMemberController.getCurrentAdminMember,
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        notes: [
          "- **Cette route n'est pas restreinte**\n" +
            '- Récupération du membre admin pix courant ayant accès à Pix Admin\n',
        ],
        tags: ['api', 'admin-members', 'current-member'],
      },
    },

    {
      method: 'POST',
      path: '/api/admin/admin-members',
      config: {
        pre: [{ method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin }],
        validate: {
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                email: Joi.string().email().required(),
                role: Joi.string().valid('SUPER_ADMIN', 'SUPPORT', 'METIER', 'CERTIF').required(),
              }),
            }),
          }),
          options: {
            allowUnknown: true,
          },
        },
        handler: srcAdminMemberController.saveAdminMember,
        notes: [
          "- Cette route est restreinte aux utilisateurs ayant les droits d'accès\n" +
            '- Elle permet de donner un accès à Pix Admin à un nouveau membre\n' +
            'ou à réactiver un membre désactivé',
        ],
        tags: ['api', 'admin', 'admin-members'],
      },
    },

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
