import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { profileController } from './profile-controller.js';

const register = async function (server) {
  const adminRoutes = [
    {
      method: 'GET',
      path: '/api/admin/users/{id}/profile',
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
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        handler: profileController.getProfileForAdmin,
        notes: [
          "- Permet à un administrateur de récupérer le nombre total de Pix d'un utilisateur\n et de ses scorecards",
        ],
        tags: ['api', 'user', 'profile'],
      },
    },
  ];

  const userRoutes = [
    {
      method: 'GET',
      path: '/api/users/{id}/profile',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        handler: profileController.getProfile,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération du nombre total de Pix de l'utilisateur\n et de ses scorecards" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'profile'],
      },
    },
  ];

  server.route([...adminRoutes, ...userRoutes]);
};

export const profileRoute = { name: 'profile/profile-api', register };
