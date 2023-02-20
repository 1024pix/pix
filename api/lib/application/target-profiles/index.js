import Joi from 'joi';
import { sendJsonApiError, BadRequestError } from '../http-errors';
import securityPreHandlers from '../security-pre-handlers';
import targetProfileController from './target-profile-controller';
import identifiersType from '../../domain/types/identifiers-type';

export const register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/target-profile-summaries',
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
          options: {
            allowUnknown: true,
          },
          query: Joi.object({
            'filter[id]': Joi.number().integer().empty('').allow(null).optional(),
            'filter[name]': Joi.string().empty('').allow(null).optional(),
            'page[number]': Joi.number().integer().empty('').allow(null).optional(),
            'page[size]': Joi.number().integer().empty('').allow(null).optional(),
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
      method: 'GET',
      path: '/api/admin/target-profiles/{id}',
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
      path: '/api/admin/target-profiles/{id}/stages',
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
        handler: targetProfileController.findStages,
        tags: ['api', 'admin', 'target-profiles', 'stages'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer les paliers attachés au profil cible',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/target-profiles/{id}/organizations',
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
          query: Joi.object({
            'filter[id]': Joi.number().integer().empty('').allow(null).optional(),
            'filter[name]': Joi.string().empty('').allow(null).optional(),
            'filter[type]': Joi.string().empty('').allow(null).optional(),
            'filter[external-id]': Joi.string().empty('').allow(null).optional(),
            'page[number]': Joi.number().integer().empty('').allow(null).optional(),
            'page[size]': Joi.number().integer().empty('').allow(null).optional(),
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
      path: '/api/admin/target-profiles/{id}/content-json',
      config: {
        auth: false,
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
      method: 'POST',
      path: '/api/admin/target-profiles',
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
      method: 'POST',
      path: '/api/admin/target-profiles/{id}/attach-organizations',
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
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
      method: 'POST',
      path: '/api/admin/target-profiles/{id}/badges',
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
                'skill-set-threshold': Joi.number().min(0).max(100).allow(null),
                'skill-set-name': Joi.string().allow('').allow(null),
                'skill-set-skills-ids': Joi.array().items(Joi.string()).allow(null),
                'capped-tubes-criteria': Joi.array().allow(null),
              }).required(),
              type: Joi.string().required(),
            }).required(),
          }).required(),
        },
        handler: targetProfileController.createBadge,
        tags: ['api', 'admin', 'badges'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de créer un résultat thématique rattaché au profil cible.',
        ],
      },
    },

    {
      method: 'PUT',
      path: '/api/admin/target-profiles/{id}/outdate',
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
      path: '/api/admin/target-profiles/{id}/simplified-access',
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
        handler: targetProfileController.markTargetProfileAsSimplifiedAccess,
        tags: ['api', 'admin', 'target-profiles'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de marquer un profil cible comme étant "Parcours Accès Simplifié"',
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
          payload: Joi.object({
            data: {
              attributes: {
                name: Joi.string().required().min(1),
                description: Joi.string().required().allow(null).max(500),
                comment: Joi.string().required().allow(null).max(500),
                category: Joi.string().required(),
              },
            },
          }).options({ allowUnknown: true }),
        },
        handler: targetProfileController.updateTargetProfile,
        tags: ['api', 'admin', 'target-profiles'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet de mettre à jour les attributs d'un profil cible",
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
          query: Joi.object({
            language: Joi.string().valid('fr', 'en').required(),
            title: Joi.string().required(),
          }),
        },
        handler: targetProfileController.getLearningContentAsPdf,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer le référentiel du profil cible en version pdf',
        ],
        tags: ['api', 'learning-content', 'target-profile', 'PDF'],
      },
    },
  ]);
};

export const name = 'target-profiles-api';
