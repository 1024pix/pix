import Joi from 'joi';

import { handlerWithDependencies } from '../../infrastructure/utils/handlerWithDependencies.js';
import { modulesController } from './module-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/modules/v2/{shortId}',
      config: {
        auth: false,
        handler: handlerWithDependencies(modulesController.getByShortId),
        validate: {
          params: Joi.object({ shortId: Joi.string().required() }),
          query: Joi.object({
            encryptedRedirectionUrl: Joi.string(),
          }),
        },
        notes: ['- Permet de récupérer un module grâce à son id raccourci'],
        tags: ['api', 'modules'],
      },
    },
  ]);
};

export const moduleRoute = { name: 'devcomp/modules-api', register };
