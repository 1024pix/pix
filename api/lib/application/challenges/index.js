import Joi from 'joi';
import challengeController from './challenge-controller';
import identifiersType from '../../domain/types/identifiers-type';

export const register = async function (server) {
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

export const name = 'challenges-api';
