import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

import { sendJsonApiError, UnprocessableEntityError } from '../../../shared/application/errors/http-errors.js';
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
              // note: necessary for ember object id
              id: identifiersType.sessionId,
              type: 'invigilator-authentications',
              attributes: {
                'invigilator-password': Joi.string().required(),
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
          "Elle permet l'accès à l'espace surveillant",
        ],
      },
    },
  ]);
};

export const superviseRoute = { name: 'certification/session-management/session-supervise-api', register };
