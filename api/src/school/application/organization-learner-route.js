import Joi from 'joi';
import { organizationLearnerController } from './organization-learner-controller.js';
import { securityPreHandlers } from '../../../lib/application/security-pre-handlers.js';
import { identifiersType } from '../../../lib/domain/types/identifiers-type.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/pix1d/organization-learners/{id}',
      config: {
        pre: [{ method: securityPreHandlers.checkPix1dActivated }],
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.organizationLearnerId,
          }),
        },
        handler: organizationLearnerController.getById,
        tags: ['api', 'pix1d', 'organization-learners'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs de pix1d' +
            '- Elle permet de récupérer un learner grâce à son ID',
        ],
      },
    },
  ]);
};

const name = 'school-organization-learners-api';
export { register, name };
