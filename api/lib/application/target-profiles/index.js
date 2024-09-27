import Joi from 'joi';

import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';
import { targetProfileController } from './target-profile-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/target-profiles/{id}',
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
          query: Joi.object({
            filter: Joi.object({
              badges: Joi.string().valid('certifiable').allow(null).empty(''),
            }).default({}),
          }),
        },
        handler: targetProfileController.getTargetProfileForAdmin,
        tags: ['api', 'admin', 'target-profiles'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer toutes les informations d’un profil cible',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/target-profiles/{id}/training-summaries',
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
        },
        handler: targetProfileController.findPaginatedTrainings,
        tags: ['api', 'admin', 'target-profiles', 'trainings'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer les résumés des contenus formatifs liés au profil cible',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/target-profiles',
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
          payload: Joi.object({
            data: {
              attributes: {
                name: Joi.string().required(),
                category: Joi.string().required(),
                description: Joi.string().allow(null).max(500).required(),
                comment: Joi.string().allow(null).max(500).required(),
                'is-public': Joi.boolean().required(),
                'image-url': Joi.string().uri().allow(null).required(),
                'owner-organization-id': Joi.string()
                  .pattern(/^[0-9]+$/, 'numbers')
                  .allow(null)
                  .required(),
                tubes: Joi.array()
                  .items({
                    id: Joi.string().required(),
                    level: Joi.number().required(),
                  })
                  .required(),
                'are-knowledge-elements-resettable': Joi.boolean().required(),
              },
            },
          }),
          options: {
            allowUnknown: true,
          },
        },
        handler: targetProfileController.createTargetProfile,
        tags: ['api', 'admin', 'target-profiles', 'create'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet de créer un profil cible avec ses acquis ainsi qu'un gabarit de ce profil cible",
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/target-profiles/{id}',
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
              attributes: {
                'are-knowledge-elements-resettable': Joi.boolean(),
                category: Joi.string(),
                comment: Joi.string().allow(null).max(500),
                description: Joi.string().allow(null).max(500),
                'image-url': Joi.string().uri().allow(null),
                name: Joi.string(),
                tubes: Joi.array()
                  .optional()
                  .items(
                    Joi.object({
                      id: Joi.string(),
                      level: Joi.number(),
                    }),
                  ),
              },
            },
          }),
        },
        handler: targetProfileController.updateTargetProfile,
        tags: ['api', 'admin', 'target-profiles'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet de mettre à jour les attributs d'un profil cible",
        ],
      },
    },
  ]);
};

const name = 'target-profiles-api';
export { name, register };
