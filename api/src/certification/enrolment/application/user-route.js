import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { userController } from './user-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/users/{userId}/is-certifiable',
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
          }),
        },
        handler: userController.isCertifiable,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération des informations d'éligibilité à la certification Pix et certifications complémentaires\n" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user'],
      },
    },
  ]);
};

const name = 'certification-enrolment-certification-eligibility-api';
export { name, register };
