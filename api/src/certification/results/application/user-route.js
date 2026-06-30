import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { userController } from './user-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/users/{userId}/certification-courses',
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
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            userId: identifiersType.userId,
          }),
        },
        handler: userController.findAllCertificationCourses,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés sur PixAdmin avec le rôle SuperAdmin, Certif, Support et Métier',
          "- Récupération de liste des passages en certification d'un utilisateur spécifique",
        ],
        tags: ['api', 'admin', 'user', 'certification-courses'],
      },
    },
  ]);
};

export const userRoute = { name: 'certification/results/certification-results-user-api', register };
