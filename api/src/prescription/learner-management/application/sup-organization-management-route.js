import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

import {
  NotFoundError,
  PayloadTooLargeError,
  sendJsonApiError,
  UnprocessableEntityError,
} from '../../../shared/application/http-errors.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { supOrganizationManagementController } from './sup-organization-management-controller.js';

const ERRORS = {
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
};

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/organizations/{id}/sup-organization-learners/replace-csv',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents,
            assign: 'isAdminInOrganizationManagingStudents',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        payload: {
          maxBytes: 1048576 * 10, // 10MB
          output: 'file',
          parse: 'gunzip',
          failAction: (request, h) => {
            return sendJsonApiError(
              new PayloadTooLargeError('An error occurred, payload is too large', ERRORS.PAYLOAD_TOO_LARGE, {
                maxSize: '10',
              }),
              h,
            );
          },
        },
        handler: supOrganizationManagementController.replaceSupOrganizationLearners,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés et responsables de l'organisation**\n" +
            "- Elle désactive les inscriptions existantes et importe de nouvelles inscriptions d'étudiants, en masse, depuis un fichier au format csv\n" +
            '- Elle ne retourne aucune valeur de retour',
        ],
        tags: ['api', 'organization-learners'],
      },
    },
    {
      method: 'POST',
      path: '/api/organizations/{id}/sup-organization-learners/import-csv',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents,
            assign: 'isAdminInOrganizationManagingStudents',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        payload: {
          maxBytes: 1048576 * 10, // 10MB
          output: 'file',
          parse: 'gunzip',
          failAction: (request, h) => {
            return sendJsonApiError(
              new PayloadTooLargeError('An error occurred, payload is too large', ERRORS.PAYLOAD_TOO_LARGE, {
                maxSize: '10',
              }),
              h,
            );
          },
        },
        handler: supOrganizationManagementController.importSupOrganizationLearners,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés et responsables de l'organisation**\n" +
            "- Elle permet d'importer des inscriptions d'étudiants, en masse, depuis un fichier au format csv\n" +
            '- Elle ne retourne aucune valeur de retour',
        ],
        tags: ['api', 'organization-learners'],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/organization-learners/csv-template',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          query: Joi.object({
            accessToken: Joi.string().required(),
          }).options({ allowUnknown: true }),
        },
        handler: supOrganizationManagementController.getOrganizationLearnersCsvTemplate,
        notes: [
          "- **Cette route est restreinte via un token dédié passé en paramètre avec l'id de l'utilisateur.**",
          "- Récupération d'un template CSV qui servira à téléverser les inscriptions d’étudiants",
          "- L'utilisateur doit avoir les droits d'accès ADMIN à l'organisation",
        ],
        tags: ['api', 'organization-learners'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/organizations/{id}/sup-organization-learners/{organizationLearnerId}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents,
          },
        ],
        handler: supOrganizationManagementController.updateStudentNumber,
        validate: {
          options: {
            allowUnknown: true,
          },
          params: Joi.object({
            id: identifiersType.organizationId,
            organizationLearnerId: identifiersType.organizationLearnerId,
          }),
          payload: Joi.object({
            data: {
              attributes: {
                'student-number': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
              },
            },
          }),
          failAction: (request, h, err) => {
            const isStudentNumber = err.details[0].path.includes('student-number');
            if (isStudentNumber) {
              return sendJsonApiError(new UnprocessableEntityError('Un des champs saisis n’est pas valide.'), h);
            }
            return sendJsonApiError(new NotFoundError('Ressource non trouvée'), h);
          },
        },
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés et admin au sein de l'orga**\n" +
            '- Elle met à jour le numéro étudiant',
        ],
        tags: ['api', 'sup-organization-learners'],
      },
    },
  ]);
};

const name = 'sup-organization-management';
export { name, register };
