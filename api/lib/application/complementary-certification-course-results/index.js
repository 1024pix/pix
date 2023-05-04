import Joi from 'joi';
import { identifiersType } from '../../domain/types/identifiers-type.js';
import { securityPreHandlers } from '../security-pre-handlers.js';
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
                juryLevel: Joi.string().required(),
                complementaryCertificationCourseId: identifiersType.complementaryCertificationCourseId,
              },
            },
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
export { register, name };
