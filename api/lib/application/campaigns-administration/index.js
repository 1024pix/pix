const { sendJsonApiError, PayloadTooLargeError } = require('../http-errors');

const campaignController = require('./campaign-controller');
const securityPreHandlers = require('../security-pre-handlers');
const TWENTY_MEGABYTES = 1048576 * 20;

const ERRORS = {
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
};
exports.register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/campaigns/archive-campaigns',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'adminMemberHasAtLeastOneAccessOf',
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
              h
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

exports.name = 'campaigns-administration-api';
