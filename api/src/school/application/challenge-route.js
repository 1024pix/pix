import Joi from 'joi';

import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { challengeController } from './challenge-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/pix1d/challenges/{id}',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.challengeId,
          }),
        },
        handler: challengeController.get,
        tags: ['api'],
      },
    },
  ]);
};

export const challengeRoute = { name: 'school/school-challenges-api', register };
