import Joi from 'joi';

import { BadRequestError, sendJsonApiError } from '../../shared/application/errors/http-errors.js';
import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { userAdminController } from './user-admin.controller.js';

export const userAdminRoutes = [
  {
    method: 'GET',
    path: '/api/admin/users/{id}',
    config: {
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
        failAction: (request, h) => {
          return sendJsonApiError(new BadRequestError("L'identifiant de l'utilisateur n'est pas au bon format."), h);
        },
      },
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
      handler: (request, h) => userAdminController.getUserDetails(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs administrateurs**\n' +
          "- Elle permet de récupérer le détail d'un utilisateur dans un contexte d'administration",
      ],
      tags: ['api', 'admin', 'deprecated', 'user'],
    },
  },
];
