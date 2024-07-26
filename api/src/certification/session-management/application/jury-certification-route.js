import Joi from 'joi';

import { identifiersType } from '../../../../src/shared/domain/types/identifiers-type.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { juryCertificationController } from './jury-certification-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/certifications/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCourseId,
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
};

const name = 'jury-certification-api';
export { name, register };
