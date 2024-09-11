import Joi from 'joi';

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { responseObjectErrorDoc } from '../../../shared/infrastructure/open-api-doc/response-object-error-doc.js';
import { assessmentSupervisorAuthorization } from '../../shared/application/pre-handlers/session-supervisor-authorization.js';
import { sessionLiveAlertController } from './session-live-alert-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/sessions/{sessionId}/candidates/{candidateId}/dismiss-live-alert',
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
            // TODO: Remplacer dans la route candidates/{candidateId} par users/{userId} ?
            candidateId: identifiersType.userId,
          }),
        },
        pre: [
          {
            method: assessmentSupervisorAuthorization.verifyBySessionId,
            assign: 'isSupervisorForSession',
          },
        ],
        handler: sessionLiveAlertController.dismissLiveAlert,
        tags: ['api', 'sessions', 'liveAlerts', 'certifV3'],
        notes: [
          'Cette route est restreinte au surveillant',
          'Elle permet de rejeter une alerte relevée par le candidat',
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/sessions/{id}/candidates/{candidateId}/validate-live-alert',
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
            id: identifiersType.sessionId,
            candidateId: identifiersType.userId,
          }),
        },
        pre: [
          {
            method: assessmentSupervisorAuthorization.verifyBySessionId,
            assign: 'isSupervisorForSession',
          },
        ],
        handler: sessionLiveAlertController.validateLiveAlert,
        tags: ['api', 'sessions', 'liveAlerts', 'certifV3'],
        notes: [
          'Cette route est restreinte au surveillant',
          'Elle permet de rejeter une alerte relevée par le candidat',
        ],
      },
    },
  ]);
};

const name = 'session-live-alert-api';
export { name, register };
