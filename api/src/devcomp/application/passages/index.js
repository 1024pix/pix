import Joi from 'joi';
import { passageController } from './controller.js';
import { handlerWithDependencies } from '../../infrastructure/utils/handlerWithDependencies.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/passages',
      config: {
        auth: false,
        handler: handlerWithDependencies(passageController.create),
        validate: {
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                'module-id': Joi.string().required(),
              }).required(),
            }).required(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        notes: ['- Permet de créer un passage pour un module'],
        tags: ['api', 'passages', 'modules'],
      },
    },
  ]);
};

const name = 'passages-api';
export { register, name };
