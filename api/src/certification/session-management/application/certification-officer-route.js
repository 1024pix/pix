import JoiDate from '@joi/date';
import BaseJoi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { certificationOfficerController } from './certification-officer-controller.js';

const Joi = BaseJoi.extend(JoiDate);
const register = async function (server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/admin/sessions/{id}/certification-officer-assignment',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
          }),
        },
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: certificationOfficerController.assignCertificationOfficer,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Assigne la session à un membre du pôle certification (certification-officer)',
        ],
        tags: ['api', 'session', 'assignment'],
      },
    },
  ]);
};

const name = 'session-certification-officer-api';

export { name, register };
