import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { membershipController } from './membership.controller.js';

export const membershipAdminRoutes = [
  {
    method: 'POST',
    path: '/api/admin/memberships',
    config: {
      pre: [
        {
          method: (request, h) =>
            securityPreHandlers.hasAtLeastOneAccessOf([
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
              securityPreHandlers.checkAdminMemberHasRoleSupport,
              securityPreHandlers.checkAdminMemberHasRoleMetier,
            ])(request, h),
          assign: 'hasAuthorizationToAccessAdminScope',
        },
      ],
      handler: (request, h) => membershipController.create(request, h),
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
          '- Elle permet de donner l’accès à une organisation, avec un rôle particulier pour un utilisateur donné',
      ],
      plugins: {
        'hapi-swagger': {
          payloadType: 'form',
          order: 1,
        },
      },
      tags: ['api', 'memberships'],
    },
  },
  {
    method: 'PATCH',
    path: '/api/admin/memberships/{id}',
    config: {
      pre: [
        {
          method: (request, h) =>
            securityPreHandlers.hasAtLeastOneAccessOf([
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
              securityPreHandlers.checkAdminMemberHasRoleSupport,
              securityPreHandlers.checkAdminMemberHasRoleMetier,
            ])(request, h),
          assign: 'hasAuthorizationToAccessAdminScope',
        },
      ],
      validate: {
        params: Joi.object({
          id: identifiersType.membershipId,
        }),
      },
      handler: (request, h) => membershipController.update(request, h),
      description: 'Update organization role by admin for a organization members',
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
          "- Elle permet de modifier le rôle d'un membre de l'organisation",
      ],
      plugins: {
        'hapi-swagger': {
          payloadType: 'form',
          order: 2,
        },
      },
      tags: ['api', 'memberships'],
    },
  },
];
