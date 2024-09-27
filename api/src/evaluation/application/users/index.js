import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { userController } from './user-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/users/{id}/user-has-seen-level-seven-info',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        handler: userController.rememberUserHasSeenLevelSevenInfo,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Sauvegarde le fait que l'utilisateur ait vu le message d'information d'ouverture du niveau 7" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
          "- Le contenu de la requête n'est pas pris en compte.",
        ],
        tags: ['api', 'user'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/has-seen-new-dashboard-info',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        handler: userController.rememberUserHasSeenNewDashboardInfo,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Sauvegarde le fait que l'utilisateur ait vu le message sur le nouveau dashboard" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
          "- Le contenu de la requête n'est pas pris en compte.",
        ],
        tags: ['api', 'user'],
      },
    },
  ]);
};

const name = 'evaluation-users-api';
export { name, register };
