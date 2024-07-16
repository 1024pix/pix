import Joi from 'joi';

import { identifiersType } from '../../domain/types/identifiers-type.js';
import { courseController } from './course-controller.js';

const register = async function (server) {
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

const name = 'courses-api';
export { name, register };
