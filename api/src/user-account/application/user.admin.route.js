import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
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
];
