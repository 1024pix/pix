import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { cancellationController } from './cancellation-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/admin/certification-courses/{certificationCourseId}/cancel',
      config: {
        validate: {
          params: Joi.object({
            certificationCourseId: identifiersType.certificationCourseId,
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
        handler: cancellationController.cancel,
        tags: ['api'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/certification-courses/{certificationCourseId}/uncancel',
      config: {
        validate: {
          params: Joi.object({
            certificationCourseId: identifiersType.certificationCourseId,
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
        handler: cancellationController.uncancel,
        tags: ['api'],
      },
    },
  ]);
};

const name = 'cancellation-api';
export { name, register };
