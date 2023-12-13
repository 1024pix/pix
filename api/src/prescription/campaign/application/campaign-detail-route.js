import Joi from 'joi';
import { campaignDetailController } from './campaign-detail-controller.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';
const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/campaigns/{id}',
      config: {
        pre: [{ method: securityPreHandlers.checkAuthorizationToAccessCampaign }],
        validate: {
          params: Joi.object({
            id: identifiersType.campaignId,
          }),
        },
        handler: campaignDetailController.getById,
        notes: ["- Récupération d'une campagne par son id"],
        tags: ['api', 'campaign'],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/campaigns',
      config: {
        pre: [{ method: securityPreHandlers.checkUserBelongsToOrganization }],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: campaignDetailController.findPaginatedFilteredCampaigns,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle retourne les campagnes rattachées à l’organisation.',
        ],
      },
    },
  ]);
};

const name = 'campaigns-detail-api';
export { register, name };
