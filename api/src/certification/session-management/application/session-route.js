import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../shared/constants.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { authorization } from '../../shared/application/pre-handlers/authorization.js';
import { SESSION_STATUSES } from '../../shared/domain/constants.js';
import { AlgorithmEngineVersion } from '../../shared/domain/models/AlgorithmEngineVersion.js';
import { sessionController } from './session-controller.js';

async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/sessions/{sessionId}/management',
      config: {
        pre: [
          {
            method: authorization.verifySessionAuthorization,
            assign: 'authorizationCheck',
          },
        ],
        handler: sessionController.get,
        validate: {
          params: Joi.object({ sessionId: identifiersType.sessionId }),
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
            filter: Joi.object({
              ids: Joi.array().items(identifiersType.sessionId.optional()).single().optional(),
              status: Joi.string()
                .trim()
                .valid(
                  SESSION_STATUSES.CREATED,
                  SESSION_STATUSES.FINALIZED,
                  SESSION_STATUSES.IN_PROCESS,
                  SESSION_STATUSES.PROCESSED,
                )
                .optional(),
              certificationCenterName: Joi.string().trim().optional(),
              certificationCenterExternalId: Joi.string().trim().optional(),
              startDate: Joi.date().format('iso').optional(),
              endDate: Joi.date().format('iso').optional(),
              certificationCenterType: Joi.string()
                .trim()
                .valid(CERTIFICATION_CENTER_TYPES.SUP, CERTIFICATION_CENTER_TYPES.SCO, CERTIFICATION_CENTER_TYPES.PRO)
                .optional(),
              version: Joi.number().valid(AlgorithmEngineVersion.V2, AlgorithmEngineVersion.V3).optional(),
            })
              .optional()
              .default({}),
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
    {
      method: 'GET',
      path: '/api/admin/sessions/{sessionId}',
      config: {
        validate: {
          params: Joi.object({
            sessionId: identifiersType.sessionId,
          }),
        },
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
        handler: sessionController.getJurySession,
        tags: ['api', 'sessions'],
      },
    },
  ]);
}

export const sessionRoute = { name: 'certification/session-management/session-get-api', register };
