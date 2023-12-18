import Joi from 'joi';

import { targetProfileController } from './target-profile-controller.js';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/organizations/{id}/target-profiles',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: targetProfileController.findTargetProfiles,
        tags: ['api', 'target-profile'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération des profiles cibles utilisables par l‘organisation\n',
        ],
      },
    },
  ]);
};

const name = 'orga-target-profiles-api';
export { register, name };
