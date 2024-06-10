import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { adminCampaignParticipationController } from './admin-campaign-participation-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/users/{userId}/participations',
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
            userId: identifiersType.userId,
          }),
        },
        handler: adminCampaignParticipationController.findCampaignParticipationsForUserManagement,
        notes: ["- Permet à un administrateur de lister les participations d'un utilisateur à une campagne"],
        tags: ['api', 'user', 'campaign-participations'],
      },
    },
  ]);
};

const name = 'admin-campaign-participation-api';
export { name, register };
