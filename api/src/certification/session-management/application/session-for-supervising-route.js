import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { sessionForSupervisingController } from '../../session-management/application/session-for-supervising-controller.js';
import { assessmentSupervisorAuthorization } from '../../shared/application/pre-handlers/session-supervisor-authorization.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/sessions/{id}/supervising',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
          }),
        },
        pre: [
          {
            method: assessmentSupervisorAuthorization.verifyBySessionId,
            assign: 'isSupervisorForSession',
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

const name = 'session-for-supervising-api';
export { name, register };
