import Joi from 'joi';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { stageController } from './stage-controller.js';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';

const register = async function (server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/admin/stages/{id}',
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
            id: identifiersType.stageId,
          }),
          payload: Joi.object({
            data: {
              attributes: {
                targetProfileId: Joi.number().integer().positive().required(),
                title: Joi.string().required(),
                message: Joi.string().allow('').allow(null),
                prescriberDescription: Joi.string().allow('').allow(null),
                prescriberTitle: Joi.string().allow('').allow(null),
                level: Joi.number().allow(null),
                threshold: Joi.number().allow(null),
              },
              relationships: Joi.object(),
              type: Joi.any(),
            },
          }),
        },
        handler: stageController.update,
        tags: ['api', 'admin', 'stage'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet de modifier un palier d'un profil cible",
        ],
      },
    },
  ]);
};

const name = 'stage-api';
export { register, name };
