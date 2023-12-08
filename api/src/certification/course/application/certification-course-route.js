import Joi from 'joi';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';
import { certificationCourseController } from './certification-course-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/certification-courses/{id}/reject',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCourseId,
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
        handler: certificationCourseController.reject,
        tags: ['api'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/certification-courses/{id}/unreject',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCourseId,
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
        handler: certificationCourseController.unreject,
        tags: ['api'],
      },
    },
  ]);
};

const name = 'certification-courses-api-src';
export { register, name };
