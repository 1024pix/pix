import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

import { sendJsonApiError } from '../../../shared/application/http-errors.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { usecases } from '../domain/usecases/index.js';
import { scoOrganizationManagementController } from './sco-organization-management-controller.js';

const TWENTY_MEGABYTES = 1048576 * 20;

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
          failAction: async (request, h) => {
            const authenticatedUserId = request.auth.credentials.userId;
            const organizationId = request.params.id;
            try {
              await usecases.handlePayloadTooLargeError({ organizationId, userId: authenticatedUserId });
            } catch (error) {
              return sendJsonApiError(error, h);
            }
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

export { name, register };
