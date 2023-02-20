import securityPreHandlers from '../security-pre-handlers';
import stagesController from './stages-controller';
import Joi from 'joi';
import identifiersType from '../../domain/types/identifiers-type';

export const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/stages',
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
        handler: stagesController.create,
        tags: ['api', 'admin', 'stages'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/stages/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.stageId,
          }),
        },
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
        handler: stagesController.update,
        tags: ['api', 'admin', 'stages'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de modifier un palier.',
        ],
      },
    },
  ]);
};

export const name = 'stages-api';
