import { PayloadTooLargeError, sendJsonApiError } from '../../../shared/application/errors/http-errors.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { MAX_FILE_SIZE_UPLOAD } from '../../../shared/constants.js';
import { anonymizationAdminController } from './anonymization.admin.controller.js';

const ERRORS = {
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
};

export const anonymizationAdminRoutes = [
  {
    method: 'GET',
    path: '/api/admin/anonymize/gar/template',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
          assign: 'hasAuthorizationToAccessAdminScope',
        },
      ],
      handler: (request, h) => anonymizationAdminController.getTemplateForAnonymizeGarData(request, h),
      tags: ['api', 'admin', 'organizational-entities', 'organizations'],
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN permettant un accès à l'application d'administration de Pix**\n" +
          '- Elle permet de télécharger un template de csv pour anonymiser les utilisateurs du GAR',
      ],
    },
  },
  {
    method: 'POST',
    path: '/api/admin/anonymize/gar',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
          assign: 'hasAuthorizationToAccessAdminScope',
        },
      ],
      payload: {
        maxBytes: MAX_FILE_SIZE_UPLOAD,
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
      handler: (request, h) => anonymizationAdminController.anonymizeGarData(request, h),
      tags: ['api', 'admin', 'identity-access-management', 'anonymization'],
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN permettant un accès à l'application d'administration de Pix**\n" +
          "- Elle permet d'anonymiser les utilisateurs du GAR",
      ],
    },
  },
];
