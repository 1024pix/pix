import Joi from 'joi';
import courseController from './course-controller';
import identifiersType from '../../domain/types/identifiers-type';

export const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/courses/{id}',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.courseId,
          }),
        },
        handler: courseController.get,
        tags: ['api'],
      },
    },
  ]);
};

export const name = 'courses-api';
