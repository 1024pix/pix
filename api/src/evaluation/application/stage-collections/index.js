import Joi from 'joi';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { stageCollectionController } from './stage-collection-controller.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';

const register = async function (server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/admin/stage-collections/{id}',
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
            id: identifiersType.targetProfileId,
          }),
          payload: Joi.object({
            data: {
              type: Joi.string().valid('stage-collections').required(),
              attributes: {
                stages: Joi.array()
                  .items({
                    id: Joi.string().allow(null),
                    title: Joi.string().required(),
                    message: Joi.string().allow('').required(),
                    prescriberDescription: Joi.string().allow('').allow(null),
                    prescriberTitle: Joi.string().allow('').allow(null),
                    level: Joi.number().allow(null),
                    threshold: Joi.number().allow(null),
                    isFirstSkill: Joi.boolean().allow(null),
                  })
                  .min(1)
                  .required(),
              },
            },
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
export { register, name };
