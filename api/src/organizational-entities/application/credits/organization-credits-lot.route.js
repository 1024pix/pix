import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { ORGANIZATION_FEATURE } from '../../../shared/constants.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { organizationCreditsLotController } from './organization-credits-lot.controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/organizations/{id}/credits-lots',
      config: {
        pre: [
          {
            method: securityPreHandlers.makeCheckOrganizationHasFeature(ORGANIZATION_FEATURE.CREDITS_MANAGEMENT.key),
            assign: 'checkOrganizationHasCreditsFeature',
          },
          {
            method: (request, h) => securityPreHandlers.checkUserBelongsToOrganization(request, h),
            assign: 'checkUserBelongsToOrganization',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: (request, h) => organizationCreditsLotController.getOrganizationCreditsLots(request, h),
        notes: [
          "- **Cette route est restreinte aux membres authentifiés de l'organisation**\n" +
            "- L'organisation doit avoir la feature de crédits activée\n" +
            "- Elle retourne les lots de crédits de l'organisation avec les crédits disponibles, consommés et les prescrits les ayant consommés",
        ],
        tags: ['api', 'credits-lots'],
      },
    },
  ]);
};

export const organizationCreditsLotRoute = {
  name: 'organizational-entities/organization-credits-lots-api',
  register,
};
