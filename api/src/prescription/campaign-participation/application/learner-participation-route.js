import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { learnerParticipationController } from './learner-participation-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/campaign-participations/{campaignParticipationId}',
      config: {
        validate: {
          params: Joi.object({
            campaignParticipationId: identifiersType.campaignParticipationId,
          }),
        },
        handler: learnerParticipationController.shareCampaignResult,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Partage de résultat de la campagne d‘un utilisateur, à son organisation',
        ],
        tags: ['api', 'campaign-participation'],
      },
    },
    {
      method: 'POST',
      path: '/api/campaign-participations',
      config: {
        validate: {
          payload: Joi.object({
            data: Joi.object({
              type: Joi.string(),
              attributes: Joi.object({
                'participant-external-id': Joi.string().allow(null).max(255),
                'is-retry': Joi.boolean().allow(null).default(false),
                'is-reset': Joi.boolean().allow(null).default(false),
              }).required(),
            }).required(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        handler: learnerParticipationController.save,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Création d‘une nouvelle participation à une campagne',
        ],
        tags: ['api', 'campaign-participation'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/campaign-participations/{campaignParticipationId}/begin-improvement',
      config: {
        validate: {
          params: Joi.object({
            campaignParticipationId: identifiersType.campaignParticipationId,
          }),
        },
        handler: learnerParticipationController.beginImprovement,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Elle permet de progresser à la fin d'une participation à une campagne" +
            "- Le contenu de la requête n'est pas pris en compte.",
        ],
        tags: ['api', 'campaign-participation'],
      },
    },
    {
      method: 'GET',
      path: '/api/users/{userId}/campaigns/{campaignId}/profile',
      config: {
        validate: {
          params: Joi.object({
            userId: identifiersType.userId,
            campaignId: identifiersType.campaignId,
          }),
        },
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        handler: learnerParticipationController.getUserProfileSharedForCampaign,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération du profil d’un utilisateur partagé (**userId**) pour la campagne donnée (**campaignId**)\n' +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'campaign'],
      },
    },
  ]);
};

const name = 'learner-participation-api';
export { name, register };
