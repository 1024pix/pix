import Joi from 'joi';

import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';
import { targetProfilesManagementController } from './target-profile-management-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'DELETE',
      path: '/api/admin/target-profiles/{id}/detach-organizations',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                'organization-ids': Joi.array().items(Joi.number().integer()).required(),
              },
            },
          }),
          params: Joi.object({
            id: identifiersType.targetProfileId,
          }),
        },
        handler: targetProfilesManagementController.detachOrganizations,
        tags: ['api', 'admin', 'target-profiles'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet de détacher des organisations d'un profil cible",
        ],
      },
    },
  ]);
};

const name = 'target-profile-management-api';
export { name, register };
