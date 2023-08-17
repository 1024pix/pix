import Joi from 'joi';

import { identifiersType } from '../../domain/types/identifiers-type.js';
import { securityPreHandlers } from '../security-pre-handlers.js';
import { stageCollectionController } from './stage-collection-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/admin/stage-collections/{id}',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.targetProfileId,
          }),
        },
        handler: stageCollectionController.update,
        tags: ['api', 'admin', 'stage-collections'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet de modifier une collection de paliers d'un profil cible",
        ],
      },
    },
  ]);
};

const name = 'stage-collections-api';
export { name, register };
