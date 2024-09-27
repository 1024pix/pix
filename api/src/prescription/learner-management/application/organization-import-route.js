import Joi from 'joi';

import { sendJsonApiError } from '../../../shared/application/http-errors.js';
import { PayloadTooLargeError } from '../../../shared/application/http-errors.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { ORGANIZATION_FEATURE } from '../../../shared/domain/constants.js';
import { MAX_FILE_SIZE_UPLOAD } from '../../../shared/domain/constants.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { organizationImportController } from './organization-import-controller.js';

const register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/organizations/{organizationId}/import-information',
      config: {
        pre: [
          {
            method: async (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents,
                securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents,
                securityPreHandlers.validateAllAccess([
                  securityPreHandlers.makeCheckOrganizationHasFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT.key),
                  securityPreHandlers.checkUserIsAdminInOrganization,
                ]),
              ])(request, h),
            assign: 'isAdminInOrganizationManagingStudents',
          },
        ],
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
        },
        handler: organizationImportController.getOrganizationImportStatus,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés et responsables d'une organisation avec import**\n" +
            "- Elle permet de récupérer l'état du dernier réalisé pour l'organization",
        ],
        tags: ['api', 'organization-imports'],
      },
    },
  ]);

  server.route([
    {
      method: 'POST',
      path: '/api/admin/import-organization-learners-format',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([securityPreHandlers.checkAdminMemberHasRoleSuperAdmin])(
                request,
                h,
              ),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        payload: {
          maxBytes: MAX_FILE_SIZE_UPLOAD,
          output: 'file',
          failAction: async (_, h) => {
            return sendJsonApiError(
              new PayloadTooLargeError('An error occurred, payload is too large', 'PAYLOAD_TOO_LARGE', {
                maxSize: 20,
              }),
              h,
            );
          },
        },
        handler: organizationImportController.updateOrganizationLearnerImportFormats,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés en tant qu'administrateur de l'organisation**\n" +
            "- Elle permet de mettre à jour la liste des participants de l'organisation.",
        ],
        tags: ['api', 'organization-learners'],
      },
    },
  ]);
};

const name = 'organization-import-api';

export { name, register };
