import Joi from 'joi';

const ERRORS = {
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
};

import { CombinedCourseParticipationStatuses } from '../../prescription/shared/domain/constants.js';
import { PayloadTooLargeError, sendJsonApiError } from '../../shared/application/errors/http-errors.js';
import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { MAX_FILE_SIZE_UPLOAD } from '../../shared/domain/constants.js';
import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { jwtOptionalUserAuthenticationStrategyName } from '../../shared/infrastructure/authentication-strategy-names.js';
import { combinedCourseController } from './combined-course-controller.js';
import { checkDisplayCatalogueIsEnabled } from './pre-handlers/display-catalogue.js';
import questSecurityPreHandlers from './security-pre-handlers.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/combined-courses',
      config: {
        auth: {
          strategy: jwtOptionalUserAuthenticationStrategyName,
        },
        handler: combinedCourseController.getByCode,
        validate: {
          query: Joi.object({
            filter: Joi.object({
              code: Joi.string()
                .regex(/^[a-zA-Z0-9]*$/)
                .required(),
            }).required(),
          }),
        },
        notes: ['- Récupération du parcours combiné dont le code est spécifié dans les filtres de la requête'],
        tags: ['api', 'quest'],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{organizationId}/courses',
      config: {
        pre: [
          { method: checkDisplayCatalogueIsEnabled },
          { method: securityPreHandlers.checkUserBelongsToOrganization },
        ],
        handler: combinedCourseController.getCourseByOrganizationId,
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
        },
        notes: [
          "- Récupération du catalogue de parcours liés à l'organisation (blueprints + profils cibles partagés avec l'organisation)",
        ],
        tags: ['api', 'quest', 'courses', 'target-profiles', 'catalogue', 'orga'],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{organizationId}/combined-courses',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToOrganization,
          },
        ],
        handler: combinedCourseController.getByOrganizationId,
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
          query: Joi.object({
            page: {
              number: Joi.number().integer().empty('').default(1),
              size: Joi.number().integer().empty('').default(25),
            },
          }),
        },
        notes: ["- Récupération de la liste des parcours apprenants liés a l'organisation"],
        tags: ['api', 'quest', 'combined-course'],
      },
    },
    {
      method: 'GET',
      path: '/api/combined-courses/{combinedCourseId}',
      config: {
        pre: [{ method: questSecurityPreHandlers.checkUserCanManageCombinedCourse }],
        handler: combinedCourseController.getById,
        validate: {
          params: Joi.object({
            combinedCourseId: identifiersType.combinedCourseId,
          }),
        },
        notes: [
          "- Récupération du parcours combiné dont l'id est passé en paramètre," +
            " Nécessite que l'utilisateur soit membre de l'organisation propriétaire du parcours combiné",
        ],
        tags: ['api', 'combined-course', 'orga'],
      },
    },
    {
      method: 'GET',
      path: '/api/combined-courses/{combinedCourseId}/statistics',
      config: {
        pre: [{ method: questSecurityPreHandlers.checkUserCanManageCombinedCourse }],
        handler: combinedCourseController.getStatistics,
        validate: {
          params: Joi.object({
            combinedCourseId: identifiersType.combinedCourseId,
          }),
        },
        notes: [
          "- Récupération des statistiques de participations du parcours combiné dont l'id est passé en paramètre,\n" +
            " Nécessite que l'utilisateur soit membre de l'organisation propriétaire du parcours combiné",
        ],
        tags: ['api', 'combined-course', 'orga'],
      },
    },
    {
      method: 'GET',
      path: '/api/combined-courses/{combinedCourseId}/participations',
      config: {
        pre: [{ method: questSecurityPreHandlers.checkUserCanManageCombinedCourse }],
        handler: combinedCourseController.findParticipations,
        validate: {
          params: Joi.object({
            combinedCourseId: identifiersType.combinedCourseId,
          }),
          query: Joi.object({
            page: {
              number: Joi.number().integer().empty('').default(1),
              size: Joi.number().integer().empty('').default(10),
            },
            filters: {
              fullName: Joi.string().empty('').max(255).optional(),
              statuses: Joi.array()
                .items(
                  Joi.string().valid(
                    CombinedCourseParticipationStatuses.STARTED,
                    CombinedCourseParticipationStatuses.COMPLETED,
                  ),
                )
                .optional(),
              divisions: Joi.array().items(Joi.string()).optional(),
              groups: Joi.array().items(Joi.string()).optional(),
            },
          }),
        },
        notes: [
          "- Récupération des participations du parcours combiné dont l'id est passé en paramètre,\n" +
            " Nécessite que l'utilisateur soit membre de l'organisation propriétaire du parcours combiné",
        ],
        tags: ['api', 'combined-course', 'orga'],
      },
    },
    {
      method: 'GET',
      path: '/api/combined-courses/{combinedCourseId}/participations/{participationId}',
      config: {
        pre: [
          { method: questSecurityPreHandlers.checkUserCanManageCombinedCourse },
          { method: questSecurityPreHandlers.checkParticipationBelongsToCombinedCourse },
        ],
        handler: combinedCourseController.getCombinedCourseParticipationById,
        validate: {
          params: Joi.object({
            combinedCourseId: identifiersType.combinedCourseId,
            participationId: identifiersType.participationId,
          }),
        },
        notes: [
          "- Récupération de la participation dont l'id est passée en paramètre,\n" +
            " Nécessite que l'utilisateur soit membre de l'organisation propriétaire du parcours combiné",
        ],
        tags: ['api', 'combined-course', 'orga'],
      },
    },
    {
      method: 'PUT',
      path: '/api/combined-courses/{code}/start',
      config: {
        pre: [
          { method: questSecurityPreHandlers.checkCombinedCoursesFeatureIsEnabled },
          { method: questSecurityPreHandlers.checkAuthorizationToAccessCombinedCourse },
        ],
        validate: {
          params: Joi.object({
            code: Joi.string().regex(/^[a-zA-Z0-9]*$/),
          }),
        },
        handler: combinedCourseController.start,
        notes: ["- Démarre un parcours combiné pour l'utilisateur connecté."],
        tags: ['api', 'combined-courses'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/combined-courses/{code}/reassess-status',
      config: {
        pre: [
          { method: questSecurityPreHandlers.checkCombinedCoursesFeatureIsEnabled },
          { method: questSecurityPreHandlers.checkAuthorizationToAccessCombinedCourse },
        ],
        validate: {
          params: Joi.object({
            code: Joi.string().regex(/^[a-zA-Z0-9]*$/),
          }),
        },
        handler: combinedCourseController.reassessStatus,
        notes: ["- Mets à jour le statut du parcours combiné pour l'utilisateur connecté."],
        tags: ['api', 'combined-courses'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/combined-courses',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        payload: {
          maxBytes: MAX_FILE_SIZE_UPLOAD,
          output: 'file',
          parse: 'gunzip',
          failAction: (_, h) => {
            return sendJsonApiError(
              new PayloadTooLargeError('An error occurred, payload is too large', ERRORS.PAYLOAD_TOO_LARGE, {
                maxSize: '20',
              }),
              h,
            );
          },
        },
        handler: combinedCourseController.createCombinedCourses,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés ayant pour rôle SUPER_ADMIN**\n' +
            '- Elle permet de créer des parcours combinés à partir d‘un fichier au format CSV\n' +
            '- Elle ne retourne aucune valeur',
        ],
        tags: ['api', 'admin', 'combined-course'],
      },
    },
    {
      method: 'POST',
      path: '/api/combined-courses',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkOrganizationAccess,
            assign: 'checkOrganizationAccess',
          },
        ],
        handler: combinedCourseController.createCombinedCourse,
        notes: ['- Permet au prescripteur connecté de déployer un parcours combiné dans son organisation.'],
        tags: ['api', 'orga', 'combined-course'],
      },
    },
  ]);
};
const name = 'quest/combined-courses-api';
export { name, register };
