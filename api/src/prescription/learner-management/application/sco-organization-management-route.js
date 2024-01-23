import BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);

import { sendJsonApiError, PayloadTooLargeError } from '../../../../lib/application/http-errors.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';
import { scoOrganizationManagementController } from './sco-organization-management-controller.js';

const TWENTY_MEGABYTES = 1048576 * 20;

const ERRORS = {
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
};

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/organizations/{id}/sco-organization-learners/import-siecle',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents,
            assign: 'isAdminInOrganizationManagingStudents',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          query: Joi.object({
            format: Joi.string().default('xml'),
          }),
        },
        payload: {
          maxBytes: TWENTY_MEGABYTES,
          output: 'file',
          failAction: (request, h) => {
            return sendJsonApiError(
              new PayloadTooLargeError('An error occurred, payload is too large', ERRORS.PAYLOAD_TOO_LARGE, {
                maxSize: '20',
              }),
              h,
            );
          },
        },
        handler: scoOrganizationManagementController.importOrganizationLearnersFromSIECLE,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés et responsables de l'organisation**\n" +
            "- Elle permet d'importer des inscriptions d'élèves, en masse, depuis un fichier au format XML ou CSV de SIECLE\n" +
            '- Elle ne retourne aucune valeur de retour',
        ],
        tags: ['api', 'organization-learners'],
      },
    },
  ]);
};

const name = 'sco-organization-management';

export { register, name };
