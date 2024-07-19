import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { juryOptions } from '../../shared/domain/models/ComplementaryCertificationCourseResult.js';
import { complementaryCertificationCourseResultsController } from './complementary-certification-course-results-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/complementary-certification-course-results',
      config: {
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                juryLevel: Joi.alternatives()
                  .try(
                    identifiersType.complementaryCertificationBadgeId,
                    Joi.string().valid(juryOptions.REJECTED).valid(juryOptions.UNSET),
                  )
                  .required(),
                complementaryCertificationCourseId: identifiersType.complementaryCertificationCourseId,
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
        handler: complementaryCertificationCourseResultsController.saveJuryComplementaryCertificationCourseResult,
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n",
          "- Elle permet de sauvegarder le volet jury d'une certification complémentaire Pix+ Edu",
        ],
        tags: ['api', 'admin', 'complementary-certification-course-results', 'Pix+ Édu'],
      },
    },
  ]);
};

const name = 'complementary-certification-course-results-api';
export { name, register };
