import Joi from 'joi';

import { BadRequestError, NotFoundError, sendJsonApiError } from '../../../shared/application/http-errors.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType, optionalIdentifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { filterType } from '../../shared/domain/types/identifiers-type.js';
import { targetProfileController } from './admin-target-profile-controller.js';

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
      method: 'PUT',
      path: '/api/admin/target-profiles/{targetProfileId}/outdate',
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
            targetProfileId: identifiersType.targetProfileId,
          }),
        },
        handler: targetProfileController.outdateTargetProfile,
        tags: ['api', 'admin', 'target-profiles'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de marquer un profil cible comme obsolète',
        ],
      },
    },
    {
      method: 'PUT',
      path: '/api/admin/target-profiles/{targetProfileId}/simplified-access',
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
            targetProfileId: identifiersType.targetProfileId,
          }),
        },
        handler: targetProfileController.markTargetProfileAsSimplifiedAccess,
        tags: ['api', 'admin', 'target-profiles'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de marquer un profil cible comme étant "Parcours Accès Simplifié"',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/target-profiles/{id}/attach-organizations',
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
            'organization-ids': Joi.array().items(Joi.number().integer()).required(),
          }),
          params: Joi.object({
            id: identifiersType.targetProfileId,
          }),
        },
        handler: targetProfileController.attachOrganizations,
        tags: ['api', 'admin', 'target-profiles'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de rattacher des organisations à un profil cible',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/target-profiles/{id}/copy-organizations',
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
            'target-profile-id': Joi.number().integer().required(),
          }),
          params: Joi.object({
            id: identifiersType.targetProfileId,
          }),
        },
        handler: targetProfileController.attachOrganizationsFromExistingTargetProfile,
        tags: ['api', 'admin', 'target-profiles'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de rattacher à un profil cible donné les organisations d’un profil cible existant (id de ce dernier en payload)',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/target-profiles/{id}/learning-content-pdf',
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
            language: Joi.string().valid('fr', 'en').required(),
          }),
        },
        handler: targetProfileController.getLearningContentAsPdf,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer le référentiel du profil cible en version pdf',
        ],
        tags: ['api', 'admin', 'target-profile', 'pdf'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/target-profiles/{id}/content-json',
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
        handler: targetProfileController.getContentAsJsonFile,
        tags: ['api', 'admin', 'target-profiles', 'json'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer le profil cible dans un fichier json',
        ],
      },
    },
    {
      method: 'DELETE',
      path: '/api/admin/target-profiles/{targetProfileId}/detach-organizations',
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
            targetProfileId: identifiersType.targetProfileId,
          }),
        },
        handler: targetProfileController.detachOrganizations,
        tags: ['api', 'admin', 'target-profiles'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet de détacher des organisations d'un profil cible",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/{organizationId}/attach-target-profiles',
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
            'target-profile-ids': Joi.array().items(Joi.number().integer()).required(),
          }),
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
          failAction: (request, h) => {
            return sendJsonApiError(
              new NotFoundError("L'id d'un des profils cible ou de l'organisation n'est pas valide"),
              h,
            );
          },
        },
        handler: targetProfileController.attachTargetProfiles,
        tags: ['api', 'admin', 'target-profiles', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de rattacher des profil cibles à une organisation',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/target-profiles/{targetProfileId}/copy',
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
            targetProfileId: identifiersType.targetProfileId,
          }),
        },
        handler: targetProfileController.copyTargetProfile,
        tags: ['api', 'admin', 'target-profiles', 'copy'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de dupliquer un profil cible',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/target-profiles/{targetProfileId}/organizations',
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
            targetProfileId: identifiersType.targetProfileId,
          }),
          query: Joi.object({
            filter: Joi.object({
              id: optionalIdentifiersType.organizationId,
              name: Joi.string().empty('').allow(null).optional(),
              type: Joi.string().empty('').allow(null).optional(),
              'external-id': Joi.string().empty('').allow(null).optional(),
            }).default({}),
            page: {
              number: Joi.number().integer().empty('').allow(null).optional(),
              size: Joi.number().integer().empty('').allow(null).optional(),
            },
          }).options({ allowUnknown: true }),
        },
        handler: targetProfileController.findPaginatedFilteredTargetProfileOrganizations,
        tags: ['api', 'admin', 'target-profiles', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer les organisations auxquelles est rattaché le profil cible',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/{id}/target-profile-summaries',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: targetProfileController.findTargetProfileSummariesForAdmin,
        tags: ['api', 'organizations', 'target-profiles'],
        notes: [
          `- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n- Elle retourne la liste des profil cibles d'une organisation`,
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/target-profile-summaries',
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
          options: {
            allowUnknown: true,
          },
          query: Joi.object({
            filter: Joi.object({
              id: Joi.number().integer().empty('').allow(null).optional(),
              name: Joi.string().empty('').allow(null).optional(),
              categories: [filterType.targetProfileCategory, Joi.array().items(filterType.targetProfileCategory)],
            }).default({}),
            page: Joi.object({
              number: Joi.number().integer().empty('').allow(null).optional(),
              size: Joi.number().integer().empty('').allow(null).optional(),
            }).default(),
          }),
          failAction: (request, h) => {
            return sendJsonApiError(new BadRequestError('Un des champs de recherche saisis est invalide.'), h);
          },
        },
        handler: targetProfileController.findPaginatedFilteredTargetProfileSummariesForAdmin,
        tags: ['api', 'admin', 'target-profiles'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer & chercher une liste de profils cible\n' +
            '- Cette liste est paginée et filtrée selon un **id** et/ou un **name** donnés',
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/target-profiles/{targetProfileId}',
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
            targetProfileId: identifiersType.targetProfileId,
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

const name = 'admin-target-profiles-api';
export { name, register };
