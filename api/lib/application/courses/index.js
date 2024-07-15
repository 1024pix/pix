import Joi from 'joi';

import { courseController } from '../../../src/shared/application/courses/course-controller.js';
import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';

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
