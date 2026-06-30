import Joi from 'joi';

import { identifiersType } from '../../../../src/shared/domain/types/identifiers-type.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { juryCertificationController } from './jury-certification-controller.js';

async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/certifications/{certificationCourseId}',
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
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: juryCertificationController.getJuryCertification,
        tags: ['api'],
      },
    },
  ]);
}

const name = 'certification/session-management/jury-certification-api';
export const juryCertificationRoute = { name, register };
