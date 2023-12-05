import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import BaseJoi from 'joi';
import JoiDate from '@joi/date';
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
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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

export { register, name };
