import Joi from 'joi';

import { PayloadTooLargeError, sendJsonApiError } from '../../shared/application/http-errors.js';
import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { organizationController } from './organization-controller.js';

const ERRORS = {
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
};
const TWENTY_MEGABYTES = 1048576 * 20;

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/organizations/{organizationId}/attach-child-organization',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
          payload: Joi.object({
            childOrganizationId: identifiersType.organizationId,
          }),
        },
        handler: organizationController.attachChildOrganization,
        tags: ['api', 'admin', 'organizational-entities', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN, METIER ou SUPPORT permettant un accès à l'application d'administration de Pix**\n" +
            "- Elle permet d'attacher une organisation mère à une organisation fille",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/add-organization-features',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
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
        handler: organizationController.addOrganizationFeatureInBatch,
        tags: ['api', 'admin', 'organizational-entities', 'organizations', 'organization-features'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN permettant un accès à l'application d'administration de Pix**\n" +
            "- Elle permet d'activer une fonctionnalité à des organisations",
        ],
      },
    },
  ]);
};

const name = 'organizational-entities-api';
const organizationalEntitiesRoutes = [{ register, name }];

export { organizationalEntitiesRoutes };
