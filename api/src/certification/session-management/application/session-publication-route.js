import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { sessionPublicationController } from './session-publication-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/admin/sessions/{id}/publish',
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
        handler: sessionPublicationController.publish,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Publie toutes les certifications courses d'une session",
        ],
        tags: ['api', 'session', 'publication'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/sessions/{sessionId}/unpublish',
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
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: sessionPublicationController.unpublish,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Dépublie toutes les certifications courses d'une session",
        ],
        tags: ['api', 'session', 'publication'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/sessions/publish-in-batch',
      config: {
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                ids: Joi.array().items(identifiersType.sessionId),
              },
            },
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
        handler: sessionPublicationController.publishInBatch,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Permet de publier plusieurs sessions sans problème d'un coup",
        ],
        tags: ['api', 'session', 'publication'],
      },
    },
  ]);
};

export const sessionPublicationRoute = { name: 'certification/session-management/session-publication-api', register };
