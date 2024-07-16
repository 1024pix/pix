import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { authorization } from '../../shared/application/pre-handlers/authorization.js';
import { sessionController } from './session-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/certification-centers/{certificationCenterId}/session',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsMemberOfCertificationCenter,
            assign: 'isMemberOfCertificationCenter',
          },
        ],
        validate: {
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
          }),
        },
        handler: sessionController.createSession,
        tags: ['api', 'certification-center', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Elle permet de créer une session de certification liée au centre de certification de l’utilisateur',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/sessions/{id}',
      config: {
        pre: [
          {
            method: authorization.verifySessionAuthorization,
            assign: 'authorizationCheck',
          },
        ],
        handler: sessionController.get,
        validate: {
          params: Joi.object({ id: identifiersType.sessionId }),
        },
        tags: ['api', 'sessions', 'session enrolment'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés membre du centre de certification lié à la session **\n' +
            '- Elle permet de récupérer la session',
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/sessions/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
          }),
        },
        pre: [
          {
            method: authorization.verifySessionAuthorization,
            assign: 'authorizationCheck',
          },
        ],
        handler: sessionController.update,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Modification d'une session de certification\n" +
            '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la session à modifier',
        ],
        tags: ['api', 'session'],
      },
    },
    {
      method: 'DELETE',
      path: '/api/sessions/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
          }),
        },
        pre: [
          {
            method: authorization.verifySessionAuthorization,
            assign: 'authorizationCheck',
          },
        ],
        handler: sessionController.remove,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès au centre de certification**\n" +
            "- Supprime la session et les candidats si la session n'a pas démarrée",
        ],
        tags: ['api', 'session'],
      },
    },
  ]);
};

const name = 'certification-enrollment-api';
export { name, register };
