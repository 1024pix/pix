import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { authorization } from '../../shared/application/pre-handlers/authorization.js';
import { sessionController } from './session-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/sessions/{id}/management',
      config: {
        pre: [
          {
            method: authorization.verifySessionAuthorization,
            assign: 'authorizationCheck',
          },
        ],
        handler: sessionController.get,
        validate: {
          params: Joi.object({ id: identifiersType.sessionId }),
        },
        tags: ['api', 'sessions', 'session management'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés membre du centre de certification lié à la session **\n' +
            '- Elle permet de récupérer la session',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/sessions',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          query: Joi.object({
            filter: Joi.object().default({}),
            page: {
              number: Joi.number().integer().empty('').allow(null).optional(),
              size: Joi.number().integer().empty('').allow(null).optional(),
            },
          }),
        },
        handler: sessionController.findPaginatedFilteredJurySessions,
        tags: ['api', 'sessions'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de consulter la liste de toutes les sessions avec filtre et pagination (retourne un tableau avec n éléments)',
        ],
      },
    },
  ]);
};

const name = 'session-get-api';
export { name, register };
