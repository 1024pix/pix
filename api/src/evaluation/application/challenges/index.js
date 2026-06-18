import Joi from 'joi';

import { identifiersType } from '../../../../src/shared/domain/types/identifiers-type.js';
import { challengeController } from './challenge-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/challenges/{id}',
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

export const challengesRoute = { name: 'evaluation/challenges-api', register };
