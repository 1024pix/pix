import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { organizationController } from './organization-controller.js';

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
        tags: ['api', 'admin', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN, METIER ou SUPPORT permettant un accès à l'application d'administration de Pix**\n" +
            "- Elle permet d'attacher une organisation mère à une organisation fille",
        ],
      },
    },
  ]);
};

const name = 'organizational-entities-api';
const organizationalEntitiesRoutes = [{ register, name }];

export { organizationalEntitiesRoutes };
