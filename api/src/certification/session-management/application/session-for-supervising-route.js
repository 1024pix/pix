import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { authorization } from './pre-handlers/authorization.js';
import { sessionForSupervisingController } from './session-for-supervising-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/sessions/{sessionId}/supervising',
      config: {
        validate: {
          params: Joi.object({
            sessionId: identifiersType.sessionId,
          }),
        },
        pre: [
          {
            method: authorization.checkUserHaveInvigilatorAccessForSession,
            assign: 'isInvigilatorForSession',
          },
        ],
        handler: sessionForSupervisingController.get,
        tags: ['api', 'sessions', 'supervising'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          "Elle retourne les informations d'une session à surveiller",
        ],
      },
    },
  ]);
};

export const sessionForSupervisingRoute = {
  name: 'certification/session-management/session-for-supervising-api',
  register,
};
