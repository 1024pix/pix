import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

import { sendJsonApiError, UnprocessableEntityError } from '../../../shared/application/http-errors.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { superviseController } from '../../session-management/application/supervise-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/sessions/supervise',
      config: {
        validate: {
          payload: Joi.object({
            data: {
              id: identifiersType.supervisorAccessesId,
              type: 'supervisor-authentications',
              attributes: {
                'supervisor-password': Joi.string().required(),
                'session-id': identifiersType.sessionId,
              },
            },
          }),
          failAction: (request, h) => {
            return sendJsonApiError(new UnprocessableEntityError('Un des champs saisis n’est pas valide.'), h);
          },
        },
        handler: superviseController.supervise,
        tags: ['api', 'sessions', 'supervising'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          "Elle valide l'accès du'un surveillant à l'espace surveillant",
        ],
      },
    },
  ]);
};

const name = 'session-supervise-api';
export { name, register };
