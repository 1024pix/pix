import { sessionUnfinalizeController } from './session-unfinalize-controller.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import Joi from 'joi';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';

const register = async function (server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/admin/sessions/{id}/unfinalize',
      config: {
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
        handler: sessionUnfinalizeController.unfinalizeSession,
        validate: {
          params: Joi.object({ id: identifiersType.sessionId }),
        },
        tags: ['api', 'admin', 'sessions', 'unfinalization'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin, Support, Certif **\n' +
            '- Elle permet de définaliser une sessions finalisée',
        ],
      },
    },
  ]);
};

const name = 'session-unfinalize-api';
export { register, name };
