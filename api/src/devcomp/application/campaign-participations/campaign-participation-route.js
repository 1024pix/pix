import Joi from 'joi';

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
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
            "- Récupération des formations de la campagne d'un utilisateur",
        ],
        tags: ['api', 'campaign-participations', 'trainings'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/campaign-participations/{campaignParticipationId}/trainings/{trainingId}',
      config: {
        validate: {
          params: Joi.object({
            campaignParticipationId: identifiersType.campaignParticipationId,
            trainingId: identifiersType.trainingId,
          }),
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                'is-relevant': Joi.boolean().required(),
              }).required(),
            }).required(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        handler: campaignParticipationController.saveUserRelevanceFeedbackOnRecommendedTraining,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Enregistrement de la pertinence d'un contenu formatif recommandé",
        ],
        tags: ['api', 'campaign-participations', 'trainings'],
      },
    },
  ]);
};

const name = 'devcomp/old-campaign-participations-api';
export { name, register };
