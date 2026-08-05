import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { anonymizeUserController } from './anonymize-user.controller.js';

async function register(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/users/{id}/anonymize',
      config: {
        validate: { params: Joi.object({ id: identifiersType.userId }) },
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
          },
        ],
        handler: (request, h) => anonymizeUserController.anonymizeUserByAdmin(request, h),
        notes: ["Permet à un administrateur d'anonymiser un utilisateur"],
        tags: ['api', 'privacy', 'admin', 'user'],
      },
    },
    {
      method: 'DELETE',
      path: '/api/users/me',
      config: {
        handler: (request, h) => anonymizeUserController.anonymizeUserByItself(request, h),
        notes: ['Permet à l’utilisateur authentifié de supprimer son compte Pix (par anonymisation)'],
        tags: ['api', 'privacy', 'user'],
      },
    },
  ]);
}

export const anonymizeUserRoutes = { name: 'privacy/anonymize-api', register };
