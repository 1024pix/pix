import { PayloadTooLargeError, sendJsonApiError } from '../../../shared/application/http-errors.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { anonymizationAdminController } from './anonymization.admin.controller.js';

const ERRORS = {
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
};
const TWENTY_MEGABYTES = 1048576 * 20;

export const anonymizationAdminRoutes = [
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
      handler: (request, h) => anonymizationAdminController.anonymizeGarData(request, h),
      tags: ['api', 'admin', 'identity-access-management', 'anonymization'],
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN permettant un accès à l'application d'administration de Pix**\n" +
          "- Elle permet d'anonymiser les utilisateurs du GAR",
      ],
    },
  },
];
