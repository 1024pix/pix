import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { ORGANIZATION_FEATURE } from '../../../shared/constants.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { creditsLotController } from './credits-lot.admin.controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/organizations/{organizationId}/credits-lots',
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
          {
            method: securityPreHandlers.makeCheckOrganizationHasFeature(ORGANIZATION_FEATURE.CREDITS_MANAGEMENT.key),
            assign: 'checkOrganizationHasCreditsFeature',
          },
        ],
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object().required(),
              type: Joi.string().required(),
            }).required(),
          }).required(),
        },
        handler: (request, h) => creditsLotController.create(request, h),
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés ayant le rôle SUPER_ADMIN ou METIER**\n' +
            "- L'organisation doit avoir la feature de crédits activée\n" +
            '- Cette route permet de créer un lot de crédits',
        ],
        tags: ['api', 'credits-lots'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/{organizationId}/credits-lots',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
          {
            method: securityPreHandlers.makeCheckOrganizationHasFeature(ORGANIZATION_FEATURE.CREDITS_MANAGEMENT.key),
            assign: 'checkOrganizationHasCreditsFeature',
          },
        ],
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
        },
        handler: (request, h) => creditsLotController.findOrganizationCreditsLot(request, h),
        notes: [
          "- **Cette route permet de récupérer les lots de crédits d'une organisation**\n" +
            "- L'organisation doit avoir la feature de crédits activée",
        ],
        tags: ['api', 'credits-lots'],
      },
    },
  ]);
};

export const creditsLotsAdminRoute = {
  name: 'organizational-entities/credits-lots-admin-api',
  register,
};
