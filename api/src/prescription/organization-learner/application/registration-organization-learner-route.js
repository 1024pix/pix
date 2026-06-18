import Joi from 'joi';

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { registrationOrganizationLearnerController } from './registration-organization-learner-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/organization-learners',
      config: {
        handler: registrationOrganizationLearnerController.findAssociation,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération du prescrit\n' +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'organization-learners'],
        validate: {
          query: Joi.object({
            userId: identifiersType.userId,
            organizationId: identifiersType.organizationId,
          }),
        },
      },
    },
  ]);
};

export const registrationOrganizationLearnerRoute = {
  name: 'prescription/organization-learner/registration-organization-learner-api',
  register,
};
