import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { certificationRescoringController } from './certification-rescoring-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/certifications/{certificationCourseId}/rescore',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({ certificationCourseId: identifiersType.certificationCourseId }),
        },
        handler: certificationRescoringController.rescoreCertification,
        tags: ['api', 'sessions', 'scoring'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle Super Admin ou Certif**\n' +
            '- Elle permet de rescorer une certification',
        ],
      },
    },
  ]);
};

export const certificationRescoringRoute = { name: 'certification/evaluation/certification-rescoring-api', register };
