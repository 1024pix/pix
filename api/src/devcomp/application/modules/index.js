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
          params: Joi.object({ slug: Joi.string().required() }),
        },
        notes: ['- Permet de récupérer un module grâce à son titre slugifié'],
        tags: ['api', 'modules'],
      },
    },
    {
      method: 'POST',
      path: '/api/modules/answers',
      config: {
        auth: false,
        handler: modulesController.validateAnswer,
        validate: {
          payload: Joi.object({
            moduleSlug: Joi.string().required(),
            elementId: Joi.string().required(),
            proposalSelectedId: Joi.string().required(),
          }),
        },
        notes: ['- Permet de valider la réponse à une activité soumise par un apprenant'],
        tags: ['api', 'modules', 'answers'],
      },
    },
  ]);
};

const name = 'modules-api';
export { register, name };
