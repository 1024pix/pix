import { PayloadTooLargeError, sendJsonApiError } from '../../../shared/application/errors/http-errors.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { MAX_FILE_SIZE_UPLOAD } from '../../../shared/domain/constants.js';
import { scoWhitelistController } from './sco-whitelist-controller.js';

async function register(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/sco-whitelist',
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
          failAction: (request, h) => {
            return sendJsonApiError(
              new PayloadTooLargeError('An error occurred, payload is too large', 'PAYLOAD_TOO_LARGE', {
                maxSize: '20',
              }),
              h,
            );
          },
        },
        handler: scoWhitelistController.importScoWhitelist,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          'Elle permet de mettre a jour la liste blanche des centres SCO.',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/sco-whitelist',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        handler: scoWhitelistController.exportScoWhitelist,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          'Elle permet de récupérer la liste blanche des centres SCO.',
        ],
      },
    },
  ]);
}

export const scoWhitelistRoute = { name: 'certification/configuration/sco-whitelist-api', register };
