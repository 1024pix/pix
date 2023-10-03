import Joi from 'joi';
import { modulesController } from './controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/modules/{slug}',
      config: {
        auth: false,
        handler: modulesController.getBySlug,
        validate: {
          params: Joi.object({ slug: Joi.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) }).required(),
        },
        notes: ['- Permet de récupérer un module grâce à son titre slugifié'],
        tags: ['api', 'modules'],
      },
    },
  ]);
};

const name = 'modules-api';
export { register, name };
