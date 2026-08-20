import Joi from 'joi';

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { responseObjectErrorDoc } from '../../../shared/infrastructure/open-api-doc/response-object-error-doc.js';
import { companionAlertController } from './companion-alert-controller.js';
import { authorization } from './pre-handlers/authorization.js';

function register(server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/sessions/{sessionId}/users/{userId}/clear-companion-alert',
      config: {
        plugins: {
          'hapi-swagger': {
            produces: ['application/json'],
            consumes: ['application/json'],
          },
        },
        response: {
          failAction: 'log',
          status: {
            204: Joi.string.empty,
            401: responseObjectErrorDoc,
            403: responseObjectErrorDoc,
          },
        },
        validate: {
          params: Joi.object({
            sessionId: identifiersType.sessionId,
            userId: identifiersType.userId,
          }),
        },
        pre: [
          {
            method: authorization.checkUserHaveInvigilatorAccessForSession,
            assign: 'isInvigilatorForSession',
          },
        ],
        handler: companionAlertController.clear,
        tags: ['api', 'sessions', 'liveAlerts'],
        notes: [
          'Cette route est restreinte au surveillant',
          'Elle permet de lever une alerte d’extension non détectée',
        ],
      },
    },
  ]);
}

const name = 'certification/session-management/session-management-companion-alert-api';
export const companionAlertRoute = { name, register };
