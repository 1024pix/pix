import Joi from 'joi';

import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';
import { campaignParticipationController } from './campaign-participation-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/campaign-participations/{id}/trainings',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.campaignParticipationId,
          }),
        },
        handler: campaignParticipationController.findTrainings,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération des formations de la campagne d‘un utilisateur',
        ],
        tags: ['api', 'campaign-participations', 'trainings'],
      },
    },
  ]);
};

const name = 'old-campaign-participations-api';
export { name, register };
