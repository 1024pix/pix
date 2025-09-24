import Joi from 'joi';

const ERRORS = {
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
};

import { PayloadTooLargeError, sendJsonApiError } from '../../shared/application/http-errors.js';
import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { MAX_FILE_SIZE_UPLOAD } from '../../shared/domain/constants.js';
import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { combinedCourseController } from './combined-course-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/combined-courses',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAuthorizationToAccessCombinedCourse,
          },
        ],
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
      path: '/api/combined-courses/{questId}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserCanManageCombinedCourse,
          },
        ],
        handler: combinedCourseController.getById,
        validate: {
          params: Joi.object({
            questId: identifiersType.questId,
          }),
        },
        notes: [
          "- Récupération du parcours combiné dont l'id de la quête est passé en paramètre," +
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
          {
            method: securityPreHandlers.checkAuthorizationToAccessCombinedCourse,
          },
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
          {
            method: securityPreHandlers.checkAuthorizationToAccessCombinedCourse,
          },
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
  ]);
};
const name = 'combined-courses-api';
export { name, register };
