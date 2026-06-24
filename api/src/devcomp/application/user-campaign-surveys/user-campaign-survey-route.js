import Joi from 'joi';

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { userCampaignSurveyController } from './user-campaign-survey-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/user-campaign-surveys',
      config: {
        handler: userCampaignSurveyController.saveUserCampaignSurvey,
        validate: {
          payload: Joi.object({
            data: Joi.object({
              type: Joi.string().valid('user-campaign-surveys').required(),
              attributes: Joi.object({
                'campaign-id': identifiersType.campaignId.required(),
                'satisfaction-score': Joi.number().integer().min(1).max(5).required(),
              }).required(),
            }).required(),
          }).required(),
        },
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés**\n- Enregistre le NPS d'un utilisateur pour une campagne",
        ],
        tags: ['api', 'user-campaign-surveys'],
      },
    },
  ]);
};

export const userCampaignSurveyRoute = { name: 'devcomp/user-campaign-surveys-api', register };
