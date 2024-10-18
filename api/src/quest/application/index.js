import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { questController } from './quest-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/campaign-participations/{campaignParticipationId}/quest-results',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkCampaignParticipationBelongsToUser,
          },
        ],
        handler: questController.getQuestResults,
        validate: {
          params: Joi.object({
            campaignParticipationId: identifiersType.campaignParticipationId,
          }),
        },
        notes: [
          '- **Route nécessitant une authentification**\n' +
            "- Récupère le résultat d'une quête pour une participation et un user donné",
        ],
        tags: ['api', 'quest'],
      },
    },
  ]);
};
const name = 'quest-api';
export { name, register };
