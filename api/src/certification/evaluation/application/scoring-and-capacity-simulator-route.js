import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { scoringAndCapacitySimulatorController } from './scoring-and-capacity-simulator-controller.js';

const register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/simulate-score-or-capacity',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          payload: Joi.object({
            data: Joi.object({
              score: Joi.number(),
              capacity: Joi.number(),
              date: Joi.date(),
            }).xor('score', 'capacity'),
          }),
        },
        handler: scoringAndCapacitySimulatorController.simulateScoringOrCapacity,
        tags: ['api', 'admin', 'scoring-and-capacity-simulator'],
        notes: [
          '**Cette route est restreinte aux super-administrateurs** \n' +
            'Simulation de score ou de capacité pour la certification v3',
        ],
      },
    },
  ]);
};

export const scoringAndCapacitySimulatorRoute = {
  name: 'certification/evaluation/scoring-and-capacity-simulator-api',
  register,
};
