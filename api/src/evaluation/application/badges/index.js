import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { badgesController } from './badges-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/admin/badges/{id}',
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
            id: identifiersType.badgeId,
          }),
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                key: Joi.string().required(),
                'alt-message': Joi.string().required(),
                'image-url': Joi.string().required(),
                message: Joi.string().required().allow(null, ''),
                title: Joi.string().required().allow(null),
                'is-certifiable': Joi.boolean().required(),
                'is-always-visible': Joi.boolean().required(),
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
            '- Elle permet de modifier un badge.',
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
            id: identifiersType.badgeId,
          }),
        },
        handler: badgesController.deleteUnassociatedBadge,
        tags: ['api', 'admin', 'badges'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de supprimer un badge non assigné.',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/target-profiles/{id}/badges',
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
            data: Joi.object({
              attributes: Joi.object({
                key: Joi.string().required(),
                'alt-message': Joi.string().required(),
                'image-url': Joi.string().required(),
                message: Joi.string().required().allow('').allow(null),
                title: Joi.string().required().allow('').allow(null),
                'is-certifiable': Joi.boolean().required(),
                'is-always-visible': Joi.boolean().required(),
                'campaign-threshold': Joi.number().min(0).max(100).allow(null),
                'capped-tubes-criteria': Joi.array().items({
                  name: Joi.string(),
                  threshold: Joi.string().required(),
                  cappedTubes: Joi.array()
                    .min(1)
                    .items({
                      id: Joi.string(),
                      level: Joi.number().min(0),
                    }),
                }),
              })
                .or('campaign-threshold', 'capped-tubes-criteria')
                .required(),
              type: Joi.string().required(),
            }).required(),
          }).required(),
        },
        handler: badgesController.createBadge,
        tags: ['api', 'admin', 'badges'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de créer un badge rattaché au profil cible.',
        ],
      },
    },
  ]);
};

const name = 'badges-api';
export { name, register };
