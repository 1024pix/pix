import Joi from 'joi';

import { missionController } from './mission-controller.js';
import { identifiersType } from '../../../lib/domain/types/identifiers-type.js';
import { securityPreHandlers } from '../../../lib/application/security-pre-handlers.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/pix1d/missions/{id}',
      config: {
        pre: [{ method: securityPreHandlers.checkPix1dActivated }],
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.missionId,
          }),
        },
        handler: missionController.getById,
        tags: ['api', 'pix1d', 'mission'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs de pix1d' +
            '- Elle permet de récupérer une mission Pix Editor',
        ],
      },
    },
  ]);
};

const name = 'mission-api';
export { register, name };
