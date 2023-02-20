import Joi from 'joi';
import securityPreHandlers from '../security-pre-handlers';
import prescriberController from './prescriber-controller';
import identifiersType from '../../domain/types/identifiers-type';

export const register = async function (server) {
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
        handler: prescriberController.get,
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

export const name = 'prescribers-api';
