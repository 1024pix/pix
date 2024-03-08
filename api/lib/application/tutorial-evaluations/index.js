import Joi from 'joi';

import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';
import { tutorialEvaluationsController } from './tutorial-evaluations-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'PUT',
      path: '/api/users/tutorials/{tutorialId}/evaluate',
      config: {
        handler: tutorialEvaluationsController.evaluate,
        validate: {
          params: Joi.object({
            tutorialId: identifiersType.tutorialId,
          }),
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                status: Joi.string().valid('LIKED', 'NEUTRAL').allow(null),
              }),
              type: Joi.string().valid('tutorial-evaluations'),
            }).required(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        tags: ['api', 'tutorials'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Appréciation d‘un tutoriel par l‘utilisateur courant\n' +
            '- L’id du tutoriel doit faire référence à un tutoriel existant',
        ],
      },
    },
  ]);
};

const name = 'tutorial-evaluations-api';
export { name, register };
