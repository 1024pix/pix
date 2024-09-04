import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { userAdminController } from './user.admin.controller.js';

export const userAdminRoutes = [
  {
    method: 'PUT',
    path: '/api/admin/users/{id}/unblock',
    config: {
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
      },
      pre: [
        {
          method: (request, h) =>
            securityPreHandlers.hasAtLeastOneAccessOf([
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
              securityPreHandlers.checkAdminMemberHasRoleSupport,
            ])(request, h),
        },
      ],
      handler: userAdminController.unblockUserAccount,
      notes: ["- Permet à un administrateur de débloquer le compte d'un utilisateur"],
      tags: ['api', 'user-account', 'admin'],
    },
  },
  {
    method: 'GET',
    path: '/api/admin/users',
    config: {
      pre: [
        {
          method: (request, h) =>
            securityPreHandlers.hasAtLeastOneAccessOf([
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
              securityPreHandlers.checkAdminMemberHasRoleCertif,
              securityPreHandlers.checkAdminMemberHasRoleSupport,
              securityPreHandlers.checkAdminMemberHasRoleMetier,
            ])(request, h),
        },
      ],
      validate: {
        options: {
          allowUnknown: true,
        },
        query: Joi.object({
          filter: Joi.object({
            id: identifiersType.userId.empty('').allow(null).optional(),
            firstName: Joi.string().empty('').allow(null).optional(),
            lastName: Joi.string().empty('').allow(null).optional(),
            email: Joi.string().empty('').allow(null).optional(),
            username: Joi.string().empty('').allow(null).optional(),
          }).default({}),
          page: Joi.object({
            number: Joi.number().integer().empty('').allow(null).optional(),
            size: Joi.number().integer().empty('').allow(null).optional(),
          }).default({}),
        }),
      },
      handler: (request, h) => userAdminController.findPaginatedFilteredUsers(request, h),
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
          '- Elle permet de récupérer & chercher une liste d’utilisateurs\n' +
          '- Cette liste est paginée et filtrée selon un **id**, **firstName**, un **lastName**, un **email** et **identifiant** donnés',
      ],
      tags: ['api', 'admin', 'user'],
    },
  },
];
