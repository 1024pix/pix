import Joi from 'joi';

import { identifiersType } from '../../../../src/shared/domain/types/identifiers-type.js';
import { campaignStatsController } from './campaign-stats-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/campaigns/{id}/stats/participations-by-stage',
      config: {
        validate: {
          params: Joi.object({ id: identifiersType.campaignId }),
        },
        handler: campaignStatsController.getParticipationsByStage,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération des statistiques de participations par paliers',
        ],
        tags: ['api', 'campaign', 'stats'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/stats/participations-by-status',
      config: {
        validate: {
          params: Joi.object({ id: identifiersType.campaignId }),
        },
        handler: campaignStatsController.getParticipationsByStatus,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération des répartitions des participations par statut',
        ],
        tags: ['api', 'campaign', 'stats'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/stats/participations-by-day',
      config: {
        validate: {
          params: Joi.object({ id: identifiersType.campaignId }),
        },
        handler: campaignStatsController.getParticipationsByDay,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération des répartitions des participations par jour',
        ],
        tags: ['api', 'campaign', 'stats'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/stats/participations-by-mastery-rate',
      config: {
        validate: {
          params: Joi.object({ id: identifiersType.campaignId }),
        },
        handler: campaignStatsController.getParticipationsCountByMasteryRate,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération de la répartition du pourcentage de réussite',
        ],
        tags: ['api', 'campaign', 'stats'],
      },
    },
  ]);
};

const name = 'campaigns-statistics-api';
export { name, register };
