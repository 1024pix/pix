import Joi from 'joi';

import { certificationCenterController } from '../../../../src/certification/session-management/application/certification-centers-session-summaries-controller.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { SESSION_STATUSES } from '../../shared/domain/constants.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/certification-centers/{id}/session-summaries',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCenterId,
          }),
          query: Joi.object({
            filter: Joi.object({
              sessionId: Joi.number(),
              status: Joi.string().valid(...Object.values(SESSION_STATUSES)),
            }).default({}),
            page: Joi.object({
              number: Joi.number().integer().empty('').allow(null).optional(),
              size: Joi.number().integer().empty('').allow(null).optional(),
            }).default({}),
          }),
        },
        handler: certificationCenterController.findPaginatedFilteredSessionSummaries,
        tags: ['api', 'certification-center'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n',
          '- Elle retourne les sessions rattachées au centre de certification.',
        ],
      },
    },
  ]);
};

export const certificationCentersSessionSummariesRoute = {
  name: 'certification/session-management/session-summaries-api',
  register,
};
