import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { ORGANIZATION_FEATURE } from '../../shared/domain/constants.js';
import { attestationController } from './attestation-controller.js';

const MAX_FILE_SIZE_UPLOAD = 1048576 * 1; // 1Mb

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/attestations',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          payload: Joi.object({
            templateKey: Joi.string().required(),
            templateName: Joi.string().required(),
            templateFile: Joi.any().required(),
            label: Joi.string().required(),
          }).required(),
        },
        payload: {
          maxBytes: MAX_FILE_SIZE_UPLOAD,
          multipart: { output: 'annotated' },
          output: 'file',
          parse: true,
        },
        handler: attestationController.save,
        notes: ["- Creation d'une attestation"],
        tags: ['api', 'attestation'],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{organizationId}/attestations',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToOrganization,
            assign: 'checkUserBelongsToOrganization',
          },
          {
            method: securityPreHandlers.makeCheckOrganizationHasFeature(
              ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key,
            ),
            assign: 'makeCheckOrganizationHasFeature',
          },
        ],
        handler: attestationController.getAllByOrganizationId,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle retourne les attestations rattachées à l’organisation.',
        ],
      },
    },
  ]);
};

const name = 'quest/attestations-api';
export { name, register };
