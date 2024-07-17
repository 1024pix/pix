import Joi from 'joi';

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { subscriptionController } from './subscription-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/certification-candidates/{id}/subscriptions',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCandidateId,
          }),
        },
        handler: subscriptionController.getSubscription,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Renvoie les informations d'inscription et d'élligibilité au passage de la certification complémentaire d'un candidat",
        ],
        tags: ['api', 'certification-candidates', 'subscriptions'],
      },
    },
  ]);
};

const name = 'subscription-api';
export { name, register };
