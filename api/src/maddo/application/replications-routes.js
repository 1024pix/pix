import Joi from 'joi';

import { replicate } from './replications-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/replications/{replicationName}',
      config: {
        auth: { access: { scope: 'replication' } },
        validate: {
          params: Joi.object({
            replicationName: Joi.string().max(255),
          }),
          query: Joi.object({
            async: Joi.boolean().default(true),
          }),
        },
        handler: replicate,
        description: 'Lancer un job de réplication.',
        notes: [
          'Permet à une application de lancer une réplication entre le datawarehouse et le datamart.',
          '**Cette route nécessite le scope replication.**',
        ],
        tags: ['api', 'replications'],
      },
    },
  ]);
};

export const replicationsRoute = { name: 'maddo/maddo-replications-api', register };
