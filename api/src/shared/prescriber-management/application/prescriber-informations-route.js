import Joi from 'joi';

import { identifiersType } from '../../../../src/shared/domain/types/identifiers-type.js';
import { prescriberInformationsController } from '../../../team/application/prescriber-informations.controller.js';
import { securityPreHandlers } from '../../application/security-pre-handlers.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/prescription/prescribers/{userId}',
      config: {
        validate: {
          params: Joi.object({
            userId: identifiersType.userId,
          }),
        },
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        handler: prescriberInformationsController.get,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération d’un prescripteur.\n' +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'prescription'],
      },
    },
  ]);
};

const name = 'prescribers-api';
export { name, register };
