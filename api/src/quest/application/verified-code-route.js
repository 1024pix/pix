import Joi from 'joi';

import { verifiedCodeController } from './verified-code-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/verified-codes/{code}',
      config: {
        auth: false,
        handler: verifiedCodeController.get,
        validate: {
          params: Joi.object({
            code: Joi.string()
              .regex(/^[a-zA-Z0-9]*$/)
              .required(),
          }),
        },
        notes: ['- Récupère la campagne ou le parcours combiné correspondant à un code donné'],
        tags: ['api', 'verified-codes'],
      },
    },
  ]);
};
export const verifiedCodeRoute = { name: 'quest/verified-codes-api', register };
