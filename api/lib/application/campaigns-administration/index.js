import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { PayloadTooLargeError, sendJsonApiError } from '../http-errors.js';
import { campaignController } from './campaign-controller.js';
const TWENTY_MEGABYTES = 1048576 * 20;

const ERRORS = {
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
};

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/campaigns/archive-campaigns',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAtLeastOneAccessOf',
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
        handler: campaignController.archiveCampaigns,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés ayant pour rôle METIER**\n' +
            "- Elle permet d'archiver une liste définis de campagne sous le format CSV\n" +
            '- Elle ne retourne aucune valeur de retour',
        ],
        tags: ['api', 'organization-learners'],
      },
    },
  ]);
};

const name = 'old-campaigns-administration-api';
export { name, register };
