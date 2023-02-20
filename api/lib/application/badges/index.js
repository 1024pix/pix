import Joi from 'joi';
import securityPreHandlers from '../security-pre-handlers';
import badgesController from './badges-controller';
import identifiersType from '../../domain/types/identifiers-type';

export const register = async function (server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/admin/badges/{id}',
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
            id: identifiersType.badgeId,
          }),
          payload: Joi.object({
            data: Joi.object({
              id: Joi.string().required(),
              attributes: Joi.object({
                key: Joi.string().required(),
                'alt-message': Joi.string().required(),
                'image-url': Joi.string().required(),
                message: Joi.string().required().allow(null),
                title: Joi.string().required().allow(null),
                'is-certifiable': Joi.boolean().required(),
                'is-always-visible': Joi.boolean().required(),
                'campaign-threshold': Joi.number().allow(null),
                'skill-set-threshold': Joi.number().allow(null),
                'skill-set-name': Joi.string().allow(null).allow(''),
                'skill-set-skills-ids': Joi.array().items(Joi.string()).allow(null),
              }).required(),
              type: Joi.string().required(),
              relationships: Joi.object(),
            }).required(),
          }).required(),
        },
        handler: badgesController.updateBadge,
        tags: ['api', 'admin', 'badges'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de modifier un résultat thématique.',
        ],
      },
    },
    {
      method: 'DELETE',
      path: '/api/admin/badges/{id}',
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
            id: identifiersType.badgeId,
          }),
        },
        handler: badgesController.deleteUnassociatedBadge,
        tags: ['api', 'admin', 'badges'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de supprimer un résultat thématique non assigné.',
        ],
      },
    },
  ]);
};

export const name = 'badges-api';
