import BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);

import { sendJsonApiError, PayloadTooLargeError } from '../../../../lib/application/http-errors.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { supOrganizationManagementController } from './sup-organization-management-controller.js';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';

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
  ]);
};

const name = 'sup-organization-management';
export { register, name };
