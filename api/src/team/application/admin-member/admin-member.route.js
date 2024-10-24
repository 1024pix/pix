import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { adminMemberController } from './admin-member.controller.js';

export const adminMemberRoutes = [
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
    method: 'GET',
    path: '/api/admin/admin-members',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
          assign: 'hasAuthorizationToAccessAdminScope',
        },
      ],
      handler: (request, h) => adminMemberController.findAll(request, h),
      notes: [
        "- **Cette route est restreinte aux utilisateurs ayant le droit d'accès SUPER_ADMIN**\n" +
          '- Lister les utilisateurs ayant accès à Pix Admin \n',
      ],
      tags: ['api', 'admin-members'],
    },
  },
  {
    method: 'PATCH',
    path: '/api/admin/admin-members/{id}',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
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
      handler: (request, h) => adminMemberController.updateAdminMember(request, h),
      notes: [
        "- Cette route est restreinte aux utilisateurs ayant le droit d'accès SUPER_ADMIN\n" +
          "- Elle permet de changer le rôle d'un membre Pix Admin",
      ],
      tags: ['api', 'admin-members'],
    },
  },
  {
    method: 'POST',
    path: '/api/admin/admin-members',
    config: {
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
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
        },
      ],
      handler: (request, h) => adminMemberController.saveAdminMember(request, h),
      notes: [
        "- Cette route est restreinte aux utilisateurs ayant les droits d'accès\n" +
          '- Elle permet de donner un accès à Pix Admin à un nouveau membre\n' +
          'ou à réactiver un membre désactivé',
      ],
      tags: ['api', 'admin', 'admin-members'],
    },
  },
  {
    method: 'PUT',
    path: '/api/admin/admin-members/{id}/deactivate',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
          assign: 'hasAuthorizationToAccessAdminScope',
        },
      ],
      validate: {
        params: Joi.object({
          id: identifiersType.adminMemberId,
        }),
      },
      handler: (request, h) => adminMemberController.deactivateAdminMember(request, h),
      notes: [
        "- Cette route est restreinte aux utilisateurs ayant le droit d'accès SUPER_ADMIN\n" +
          '- Elle permet de désactiver un membre Pix Admin',
      ],
      tags: ['api', 'admin-members', 'deactivate'],
    },
  },
];
