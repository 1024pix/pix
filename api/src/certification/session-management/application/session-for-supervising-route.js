import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { sessionForSupervisingController } from '../../session-management/application/session-for-supervising-controller.js';
import { assessmentInvigilatorAuthorization } from '../../shared/application/pre-handlers/session-invigilator-authorization.js';

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
            method: assessmentInvigilatorAuthorization.verifyBySessionId,
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
