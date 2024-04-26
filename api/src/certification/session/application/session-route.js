import Joi from 'joi';

import { authorization } from '../../../../lib/application/preHandlers/authorization.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { sessionController } from './session-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'PUT',
      path: '/api/sessions/{id}/finalization',
      config: {
        validate: {
          options: {
            allowUnknown: true,
          },
          params: Joi.object({
            id: identifiersType.sessionId,
          }),
          payload: Joi.object({
            data: {
              attributes: {
                'examiner-global-comment': Joi.string().optional().allow(null).allow('').max(500),
                'has-incident': Joi.boolean().required(),
                'has-joining-issue': Joi.boolean().required(),
              },
            },
          }),
        },
        pre: [
          {
            method: authorization.verifySessionAuthorization,
            assign: 'authorizationCheck',
          },
        ],
        handler: sessionController.finalize,
        tags: ['api', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Elle permet de finaliser une session de certification afin de la signaler comme terminée',
        ],
      },
    },
  ]);
};

const name = 'session-api';
export { name, register };
