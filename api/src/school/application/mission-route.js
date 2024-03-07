import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { missionController } from './mission-controller.js';

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
      path: '/api/pix1d/missions/{missionId}',
      config: {
        pre: [{ method: securityPreHandlers.checkPix1dActivated }],
        auth: false,
        validate: {
          params: Joi.object({
            missionId: identifiersType.missionId,
          }),
        },
        handler: missionController.getById,
        tags: ['api', 'pix1d', 'mission'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs de pix1d' + '- Elle permet de récupérer une mission du LCMS',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/missions/{missionId}',
      config: {
        pre: [
          { method: securityPreHandlers.checkUserBelongsToOrganization },
          { method: securityPreHandlers.checkPix1dActivated },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
            missionId: identifiersType.missionId,
          }),
        },
        handler: missionController.getById,
        tags: ['api', 'pix1d', 'mission'],
        notes: [
          "- ** Cette route est restreinte aux membres d'une organisation pix1d" +
            '- Elle permet de récupérer une mission du LCMS',
        ],
      },
    },
  ]);
};

const name = 'mission-api';
export { name, register };
