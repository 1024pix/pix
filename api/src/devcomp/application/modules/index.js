import Joi from 'joi';
import { modulesController } from './controller.js';
import { handlerWithDependencies } from '../../infrastructure/utils/handlerWithDependencies.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/modules/{slug}',
      config: {
        auth: false,
        handler: handlerWithDependencies(modulesController.getBySlug),
        validate: {
          params: Joi.object({ slug: Joi.string().required() }),
        },
        notes: ['- Permet de récupérer un module grâce à son titre slugifié'],
        tags: ['api', 'modules'],
      },
    },
  ]);
};

const name = 'modules-api';
export { register, name };
