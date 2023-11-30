import Joi from 'joi';
import { schoolController } from './school-controller.js';
import { securityPreHandlers } from '../../../lib/application/security-pre-handlers.js';
import { identifiersType } from '../../../lib/domain/types/identifiers-type.js';

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
export { register, name };
