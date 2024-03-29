import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import badgeCriteriaController from './badge-criteria-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/admin/badge-criteria/{badgeCriterionId}',
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
            badgeCriterionId: identifiersType.badgeCriterionId,
          }),
          payload: Joi.object({
            data: {
              type: Joi.string().valid('badge-criteria'),
              attributes: {
                'capped-tubes': Joi.array()
                  .items({
                    id: Joi.string(),
                    level: Joi.number().min(0),
                  })
                  .optional(),
                name: Joi.string().optional(),
                threshold: Joi.number().integer().min(0).max(100).optional(),
              },
            },
          }),
        },
        handler: badgeCriteriaController.updateCriterion,
        tags: ['api', 'admin', 'bagde-criteria'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet de modifier un critère d'acquisition d'un résultat thématique",
        ],
      },
    },
  ]);
};

const name = 'stage-api';
export { name, register };
