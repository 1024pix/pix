import Joi from 'joi';

import { handlerWithDependencies } from '../../infrastructure/utils/handlerWithDependencies.js';
import { passageEventsController } from './passage-event-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/passage-events',
      config: {
        auth: false,
        handler: handlerWithDependencies(passageEventsController.create),
        validate: {
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                'passage-events': Joi.array()
                  .items(
                    Joi.object({
                      'occurred-at': Joi.number().required(),
                      'sequence-number': Joi.number().required(),
                      type: Joi.string().required(),
                    }),
                  )
                  .min(1),
              }).required(),
            }).required(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        notes: ['- Permet de créer un évènement utilisateur pour un passage'],
        tags: ['api', 'passages', 'modules', 'events'],
      },
    },
  ]);
};

export const passageEventRoute = { name: 'devcomp/passage-events-api', register };
