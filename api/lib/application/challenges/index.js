import Joi from 'joi';

import { identifiersType } from '../../domain/types/identifiers-type.js';
import { securityPreHandlers } from '../security-pre-handlers.js';
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
    {
      method: 'GET',
      path: '/api/pix1d/challenges/{id}',
      config: {
        pre: [{ method: securityPreHandlers.checkPix1dActivated }],
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

const name = 'challenges-api';
export { name, register };
