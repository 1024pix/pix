import Joi from 'joi';

import { missionController } from './mission-controller.js';
import { identifiersType } from '../../../lib/domain/types/identifiers-type.js';
import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/pix1d/missions',
      config: {
        pre: [{ method: securityPreHandlers.checkPix1dActivated }],
        auth: false,
        handler: missionController.findAll,
        tags: ['api', 'pix1d', 'mission'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs de pix1d' +
            '- Elle permet de récupérer la liste des missions du LCMS',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/missions',
      config: {
        pre: [
          { method: securityPreHandlers.checkUserBelongsToOrganization },
          { method: securityPreHandlers.checkPix1dActivated },
        ],
        handler: missionController.findAll,
        tags: ['api', 'pix1d', 'mission'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs d'une organisation pix1d spécifique" +
            '- Elle permet de récupérer la liste des missions du LCMS',
        ],
      },
    },
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
          '- **Cette route est restreinte aux utilisateurs de pix1d' + '- Elle permet de récupérer une mission du LCMS',
        ],
      },
    },
  ]);
};

const name = 'mission-api';
export { register, name };
