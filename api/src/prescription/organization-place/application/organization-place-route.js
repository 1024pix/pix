import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';
import { organizationPlaceController } from './organization-place-controller.js';
import Joi from 'joi';
import { ORGANIZATION_FEATURE } from '../../../../lib/domain/constants.js';

const register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/organizations/{id}/places',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
        handler: organizationPlaceController.findOrganizationPlacesLot,
        tags: ['api', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle retourne la liste des commandes de places faites par l'organisation",
        ],
      },
    },
    {
      method: 'DELETE',
      path: '/api/admin/organizations/{id}/places/{placeId}',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
            placeId: identifiersType.placeId,
          }),
        },
        handler: organizationPlaceController.deleteOrganizationPlacesLot,
        tags: ['api', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet la suppression d'un lot de place",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/{id}/places/capacity',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
        handler: organizationPlaceController.getOrganizationPlacesCapacity,
        tags: ['api', 'organizations'],
        notes: [
          `- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n- Elle retourne la capacité en places par catégorie pour une organisation`,
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/{id}/places',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
          },
        ],
        handler: organizationPlaceController.createOrganizationPlacesLot,
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés en tant que responsables de l'organisation**\n" +
            "- Elle permet d'ajouter un lot des places à une organization",
        ],
        tags: ['api', 'organizations'],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/place-statistics',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInOrganization,
            assign: 'isAdminInOrganization',
          },
          {
            method: securityPreHandlers.makeCheckOrganizationHasFeature(ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key),
            assign: 'checkOrganizationHasPlacesFeature',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationPlaceController.getOrganizationPlacesStatistics,
        tags: ['api', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés en tant qu'administrateur de l'organisation**\n" +
            "- Elle permet la récuperation des statistiques de places de l'organisation",
        ],
      },
    },
  ]);
};

const name = 'organization-place-api';

export { register, name };
