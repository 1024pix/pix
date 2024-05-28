import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { prescriberInformationsController } from './prescriber-informations.controller.js';

export const prescriberInformationsRoute = [
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
          method: (request, h) => securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, h),
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      handler: (request, h) => prescriberInformationsController.get(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération d’un prescripteur.\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
      ],
      tags: ['api', 'team', 'prescriber'],
    },
  },
];
