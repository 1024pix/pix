import JoiDate from '@joi/date';
import BaseJoi from 'joi';

const Joi = BaseJoi.extend(JoiDate);

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { ORGANIZATION_FEATURE } from '../../../shared/domain/constants.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { jwtApplicationAuthenticationStrategyName } from '../../../shared/infrastructure/authentication-strategy-names.js';
import { organizationPlaceController } from './organization-place-controller.js';

const register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/organizations/{id}/places',
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
              securityPreHandlers.hasAtLeastOneAccessOf([
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
      method: 'POST',
      path: '/api/admin/organizations/{id}/places',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
          },
          {
            method: securityPreHandlers.makeCheckOrganizationHasFeature(ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key),
            assign: 'checkOrganizationHasPlacesFeature',
          },
        ],
        handler: organizationPlaceController.createOrganizationPlacesLot,
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                count: Joi.number().integer().min(0).required(),
                category: Joi.string().required(),
                reference: Joi.string().required(),
                'activation-date': Joi.date().required(),
                'expiration-date': Joi.date().required(),
              }).options({ stripUnknown: true }),
              type: Joi.string().required(),
            }),
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
            method: securityPreHandlers.makeCheckOrganizationHasFeature(ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key),
            assign: 'checkOrganizationHasPlacesFeature',
          },
          {
            method: securityPreHandlers.checkUserBelongsToOrganization,
            assign: 'checkUserBelongsToOrganization',
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
          "- **Cette route est restreinte aux utilisateurs authentifiés de l'organisation**\n" +
            "- Elle permet la récuperation des statistiques de places de l'organisation",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/data/organization-places',
      config: {
        auth: { strategy: jwtApplicationAuthenticationStrategyName, access: { scope: 'statistics' } },
        handler: organizationPlaceController.getDataOrganizationsPlacesStatistics,
        tags: ['api', 'organization-places', 'data'],
        notes: [
          '- **Cette route est restreinte a la stack data**\n' +
            '- Elle permet la récuperation des statistiques de places de toutes les organisations',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/organizations/{id}/places-lots',
      config: {
        pre: [
          {
            method: securityPreHandlers.makeCheckOrganizationHasFeature(ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key),
            assign: 'checkOrganizationHasPlacesFeature',
          },
          {
            method: securityPreHandlers.checkUserIsAdminInOrganization,
            assign: 'checkUserIsAdminInOrganization',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
        },
        handler: organizationPlaceController.getOrganizationPlacesLots,
        tags: ['api', 'organization-places'],
        notes: [
          "- **Cette route est restreinte aux administrateurs authentifiés de l'organisation**\n" +
            "- Elle permet la récuperation des lots de places de l'organisation",
        ],
      },
    },
  ]);
};

export const organizationPlaceRoute = { name: 'prescription/organization-place/organization-place-api', register };
