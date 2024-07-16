import Joi from 'joi';

import { organizationAdminController as srcOrganizationController } from '../../../src/organizational-entities/application/organization/organization.admin.controller.js';
import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';
import { PayloadTooLargeError, sendJsonApiError } from '../http-errors.js';
import { organizationAdministrationController as organizationController } from './organization-administration-controller.js';

const ERRORS = {
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
};
const TWO_AND_HALF_MEGABYTES = 1048576 * 2.5;

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/organizations/{id}',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: srcOrganizationController.getOrganizationDetails,
        tags: ['api', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer toutes les informations d’une organisation',
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/organizations/{id}',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        payload: {
          maxBytes: TWO_AND_HALF_MEGABYTES,
          failAction: (request, h) => {
            return sendJsonApiError(
              new PayloadTooLargeError('An error occurred, payload is too large', ERRORS.PAYLOAD_TOO_LARGE, {
                maxSizeInMegaBytes: '2.5',
              }),
              h,
            );
          },
        },
        handler: organizationController.updateOrganizationInformation,
        tags: ['api', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de mettre à jour tout ou partie d’une organisation',
        ],
      },
    },
  ]);
};

const name = 'organizations-administration-api';
export { name, register };
