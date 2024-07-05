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
        pre: [
          { method: securityPreHandlers.checkPix1dActivated },
          { method: securityPreHandlers.checkSchoolSessionIsActive },
        ],
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
    {
      method: 'POST',
      path: '/api/pix1d/schools/{organizationId}/session/activate',
      config: {
        pre: [
          { method: securityPreHandlers.checkPix1dActivated },
          { method: securityPreHandlers.checkUserBelongsToOrganization },
        ],
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
        },
        handler: schoolController.activateSchoolSession,
        tags: ['api', 'pix1d', 'school'],
        notes: ["- Elle permet de d'activer une session d'une orga"],
      },
    },
    {
      method: 'GET',
      path: '/api/pix1d/schools/{organizationId}/divisions',
      config: {
        pre: [
          { method: securityPreHandlers.checkPix1dActivated },
          { method: securityPreHandlers.checkUserBelongsToOrganization },
        ],
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
        },
        handler: schoolController.getDivisions,
        tags: ['api', 'pix1d', 'school'],
        notes: ["- Elle permet de récupérer la liste des classes d'une école liée à une organisation."],
      },
    },
  ]);
};

const name = 'school-api';
export { name, register };
