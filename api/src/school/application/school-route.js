import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { schoolController } from './school-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/pix1d/schools',
      config: {
        pre: [{ method: securityPreHandlers.checkPix1dActivated }],
        auth: false,
        validate: {
          query: Joi.object({
            code: identifiersType.code,
          }),
        },
        handler: schoolController.getSchool,
        tags: ['api', 'pix1d', 'school'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs de pix1d' +
            '- Elle permet de récupérer une école  grâce au code',
        ],
      },
    },
  ]);
};

const name = 'school-api';
export { name, register };
