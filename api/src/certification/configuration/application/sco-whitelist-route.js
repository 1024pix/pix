import { PayloadTooLargeError, sendJsonApiError } from '../../../shared/application/http-errors.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { scoWhitelistController } from './sco-whitelist-controller.js';

const TWENTY_MEGABYTES = 1048576 * 20;

const register = async function (server) {
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
          maxBytes: TWENTY_MEGABYTES,
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
  ]);
};

const name = 'sco-whitelist-api';
export { name, register };
