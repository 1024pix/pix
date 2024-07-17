import Joi from 'joi';

import { certificationCandidatesController } from '../../../../lib/application/certification-candidates/certification-candidates-controller.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';

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
        handler: certificationCandidatesController.getSubscription,
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
