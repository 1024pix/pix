import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
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
};

const name = 'organization-import-api';

export { name, register };
