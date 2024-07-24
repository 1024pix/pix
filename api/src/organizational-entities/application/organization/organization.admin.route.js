import Joi from 'joi';

import { PayloadTooLargeError, sendJsonApiError } from '../../../shared/application/http-errors.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { organizationAdminController } from './organization.admin.controller.js';

const ERRORS = {
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
};
const TWENTY_MEGABYTES = 1048576 * 20;
const TWO_AND_HALF_MEGABYTES = 1048576 * 2.5;

export const organizationAdminRoutes = [
  {
    method: 'GET',
    path: '/api/admin/organizations/{id}',
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
      handler: (request, h) => organizationAdminController.getOrganizationDetails(request, h),
      tags: ['api', 'organizations'],
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
          '- Elle permet de récupérer toutes les informations d’une organisation',
      ],
    },
  },
  {
    method: 'PATCH',
    path: '/api/admin/organizations/{id}',
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
          id: identifiersType.organizationId,
        }),
      },
      payload: {
        maxBytes: TWO_AND_HALF_MEGABYTES,
        failAction: (request, h) => {
          return sendJsonApiError(
            new PayloadTooLargeError('An error occurred, payload is too large', ERRORS.PAYLOAD_TOO_LARGE, {
              maxSizeInMegaBytes: '2.5',
            }),
            h,
          );
        },
      },
      handler: (request, h) => organizationAdminController.updateOrganizationInformation(request, h),
      tags: ['api', 'organizations'],
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
          '- Elle permet de mettre à jour tout ou partie d’une organisation',
      ],
    },
  },

  {
    method: 'POST',
    path: '/api/admin/organizations/{organizationId}/attach-child-organization',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
          assign: 'hasAuthorizationToAccessAdminScope',
        },
      ],
      validate: {
        params: Joi.object({
          organizationId: identifiersType.organizationId,
        }),
        payload: Joi.object({
          childOrganizationId: identifiersType.organizationId,
        }),
      },
      handler: (request, h) => organizationAdminController.attachChildOrganization(request, h),
      tags: ['api', 'admin', 'organizational-entities', 'organizations'],
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN, METIER ou SUPPORT permettant un accès à l'application d'administration de Pix**\n" +
          "- Elle permet d'attacher une organisation mère à une organisation fille",
      ],
    },
  },
  {
    method: 'POST',
    path: '/api/admin/organizations/add-organization-features',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
          assign: 'hasAuthorizationToAccessAdminScope',
        },
      ],
      payload: {
        maxBytes: TWENTY_MEGABYTES,
        output: 'file',
        failAction: (request, h) => {
          return sendJsonApiError(
            new PayloadTooLargeError('An error occurred, payload is too large', ERRORS.PAYLOAD_TOO_LARGE, {
              maxSize: '20',
            }),
            h,
          );
        },
      },
      handler: (request, h) => organizationAdminController.addOrganizationFeatureInBatch(request, h),
      tags: ['api', 'admin', 'organizational-entities', 'organizations', 'organization-features'],
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN permettant un accès à l'application d'administration de Pix**\n" +
          "- Elle permet d'activer une fonctionnalité à des organisations",
      ],
    },
  },
  {
    method: 'POST',
    path: '/api/admin/organizations/update-organizations',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, h),
          assign: 'hasAuthorizationToAccessAdminScope',
        },
      ],
      payload: {
        maxBytes: TWENTY_MEGABYTES,
        output: 'file',
        failAction: (request, h) => {
          return sendJsonApiError(
            new PayloadTooLargeError('An error occurred, payload is too large', ERRORS.PAYLOAD_TOO_LARGE, {
              maxSize: '20',
            }),
            h,
          );
        },
      },
      handler: (request, h) => organizationAdminController.updateOrganizationsInBatch(request, h),
      tags: ['api', 'admin', 'organizational-entities', 'organizations'],
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés ayant un rôle SUPER_ADMIN permettant un accès à l'application d'administration de Pix**\n" +
          "- Elle permet de mettre à jour des informations d'une ou plusieurs organisations",
      ],
    },
  },
];
