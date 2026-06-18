import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { scorecardController } from './scorecard-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/scorecards/{id}',
      config: {
        handler: scorecardController.getScorecard,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération d'un niveau par compétences de l'utilisateur\n" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/scorecards/{id}/tutorials',
      config: {
        handler: scorecardController.findTutorials,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération des tutoriels par compétences de l'utilisateur dans une scorecard \n" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api'],
      },
    },
    {
      method: 'POST',
      path: '/api/users/{userId}/competences/{competenceId}/reset',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        validate: {
          params: Joi.object({
            userId: identifiersType.userId,
            competenceId: identifiersType.competenceId,
          }),
        },
        handler: scorecardController.resetScorecard,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Cette route réinitialise le niveau d'un utilisateur donné (**userId**) pour une compétence donnée (**competenceId**)",
          '- Cette route retourne les nouvelles informations de niveau de la compétence',
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'scorecard'],
      },
    },
  ]);
};

export const scorecardsRoute = { name: 'evaluation/scorecards-api', register };
