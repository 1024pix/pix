import Joi from 'joi';

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { authorization } from '../../shared/application/pre-handlers/authorization.js';
import { sessionController } from './session-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/sessions/{id}/management',
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
        tags: ['api', 'sessions', 'session management'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés membre du centre de certification lié à la session **\n' +
            '- Elle permet de récupérer la session',
        ],
      },
    },
  ]);
};

const name = 'session-get-api';
export { name, register };
