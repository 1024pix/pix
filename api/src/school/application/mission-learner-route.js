import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { missionLearnerController } from './mission-learner-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/organizations/{id}/mission-learners',
      config: {
        pre: [
          { method: securityPreHandlers.checkUserBelongsToOrganization },
          { method: securityPreHandlers.checkPix1dActivated },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          query: Joi.object({
            'page[number]': Joi.number().integer().empty(''),
            'page[size]': Joi.number().integer().empty(''),
          }),
        },
        handler: missionLearnerController.findPaginatedMissionLearners,
        tags: ['api', 'pix1d', 'mission-learners'],
        notes: [
          '- **Cette route est restreinte aux personnes authentifiées' +
            "- Elle permet de récupérer tous les participants (organization-leaner) d'une orga",
        ],
      },
    },
  ]);
};

const name = 'mission-learners-api';
export { name, register };
