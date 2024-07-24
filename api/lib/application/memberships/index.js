import Joi from 'joi';

import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';
import { membershipController } from './membership-controller.js';

const register = async function (server) {
  const adminRoutes = [
    {
      method: 'PATCH',
      path: '/api/admin/memberships/{id}',
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
            id: identifiersType.membershipId,
          }),
        },
        handler: membershipController.update,
        description: 'Update organization role by admin for a organization members',
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet de modifier le rôle d'un membre de l'organisation",
        ],
        plugins: {
          'hapi-swagger': {
            payloadType: 'form',
            order: 2,
          },
        },
        tags: ['api', 'memberships'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/memberships/{id}/disable',
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
            id: identifiersType.membershipId,
          }),
        },
        handler: membershipController.disable,
        tags: ['api'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet la désactivation d'un membre",
        ],
      },
    },
  ];

  server.route([
    ...adminRoutes,
    {
      method: 'PATCH',
      path: '/api/memberships/{id}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInOrganization,
            assign: 'isAdminInOrganization',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.membershipId,
          }),
        },
        handler: membershipController.update,
        description: 'Update organization role by admin for a organization members',
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés en tant qu'administrateur de l'organisation**\n" +
            "- Elle permet de modifier le rôle d'un membre de l'organisation",
        ],
        plugins: {
          'hapi-swagger': {
            payloadType: 'form',
            order: 2,
          },
        },
        tags: ['api', 'memberships'],
      },
    },
    {
      method: 'POST',
      path: '/api/memberships/me/disable',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInOrganization,
            assign: 'isAdminInOrganization',
          },
          {
            method: securityPreHandlers.checkUserCanDisableHisOrganizationMembership,
            assign: 'canDisableHisOrganizationMembership',
          },
        ],
        validate: {
          payload: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
        },
        handler: membershipController.disableOwnOrganizationMembership,
        tags: ['api'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés en tant qu'administrateur de l'organisation\n" +
            "- Elle permet de se retirer d'une organisation",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/memberships/{id}/disable',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInOrganization,
            assign: 'isAdminInOrganization',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.membershipId,
          }),
        },
        handler: membershipController.disable,
        tags: ['api'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés en tant qu'administrateur de l'organisation\n" +
            "- Elle permet la désactivation d'un membre",
        ],
      },
    },
  ]);
};

const name = 'memberships-api';
export { name, register };
