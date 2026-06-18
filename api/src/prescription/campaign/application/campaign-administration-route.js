import Joi from 'joi';

import { PayloadTooLargeError, sendJsonApiError } from '../../../shared/application/errors/http-errors.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { MAX_FILE_SIZE_UPLOAD } from '../../../shared/domain/constants.js';
import { identifiersType, queriesType } from '../../../shared/domain/types/identifiers-type.js';
import { campaignAdministrationController } from './campaign-administration-controller.js';

const ERRORS = {
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
};

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/campaigns',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkOrganizationAccess,
            assign: 'checkOrganizationAccess',
          },
        ],
        handler: campaignAdministrationController.save,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Création d‘une nouvelle campagne\n' +
            '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la campagne à créer',
        ],
        tags: ['api', 'orga', 'campaign'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/campaigns/{campaignId}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAuthorizationToManageCampaign,
            assign: 'isAdminOrCreatorFromTheCampaign',
          },
          {
            method: securityPreHandlers.checkCampaignBelongsToCombinedCourse,
            assign: 'campaignBelongsToCombinedCourse',
          },
        ],
        validate: {
          params: Joi.object({
            campaignId: identifiersType.campaignId,
          }),
          payload: Joi.object({
            data: {
              type: 'campaigns',
              attributes: {
                'owner-id': identifiersType.ownerId,
                name: Joi.string().required(),
                title: Joi.string().allow(null).required(),
                'custom-landing-page-text': Joi.string().allow(null).required(),
              },
            },
          }),
          options: {
            allowUnknown: true,
          },
        },
        handler: campaignAdministrationController.update,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Modification d'une campagne\n" +
            '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la campagne à modifier',
        ],
        tags: ['api', 'orga', 'campaign'],
      },
    },
    {
      method: 'PUT',
      path: '/api/campaigns/{campaignId}/archive',
      config: {
        pre: [
          { method: securityPreHandlers.checkAuthorizationToManageCampaign },
          {
            method: securityPreHandlers.checkCampaignBelongsToCombinedCourse,
            assign: 'campaignBelongsToCombinedCourse',
          },
        ],
        validate: {
          params: Joi.object({
            campaignId: identifiersType.campaignId,
          }),
        },
        handler: campaignAdministrationController.archiveCampaign,
        tags: ['api'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' + "- Archivage d'une campagne par son id",
        ],
      },
    },
    {
      method: 'DELETE',
      path: '/api/campaigns/{campaignId}/archive',
      config: {
        pre: [{ method: securityPreHandlers.checkAuthorizationToManageCampaign }],
        validate: {
          params: Joi.object({
            campaignId: identifiersType.campaignId,
          }),
        },
        handler: campaignAdministrationController.unarchiveCampaign,
        tags: ['api'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Désarchivage d'une campagne par son id",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/campaigns/template',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        handler: campaignAdministrationController.getTemplateForCreateCampaigns,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés ayant pour rôle SUPER_ADMIN**\n' +
            '- Elle permet de télécharger le template pour créer des campagnes à partir d‘un fichier au format CSV\n' +
            '- Elle ne retourne aucune valeur',
        ],
        tags: ['api', 'admin', 'campaigns'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/campaigns',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        payload: {
          maxBytes: MAX_FILE_SIZE_UPLOAD,
          output: 'file',
          parse: 'gunzip',
          failAction: (_, h) => {
            return sendJsonApiError(
              new PayloadTooLargeError('An error occurred, payload is too large', ERRORS.PAYLOAD_TOO_LARGE, {
                maxSize: '20',
              }),
              h,
            );
          },
        },
        handler: campaignAdministrationController.createCampaigns,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés ayant pour rôle SUPER_ADMIN**\n' +
            '- Elle permet de créer des campagnes à partir d‘un fichier au format CSV\n' +
            '- Elle ne retourne aucune valeur',
        ],
        tags: ['api', 'admin', 'campaigns'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/campaigns/{campaignId}',
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
            campaignId: identifiersType.campaignId,
          }),
          payload: Joi.object({
            data: {
              type: 'campaigns',
              attributes: {
                name: Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                title: Joi.string().allow(null).required(),
                'custom-landing-page-text': Joi.string().allow(null).required(),
                'custom-result-page-text': Joi.string().allow(null).required(),
                'custom-result-page-button-text': Joi.string().allow(null).required(),
                'custom-result-page-button-url': Joi.string().allow(null).required(),
                'multiple-sendings': Joi.boolean().required(),
              },
            },
          }),
          options: {
            allowUnknown: true,
          },
        },
        handler: campaignAdministrationController.updateCampaignDetails,
        tags: ['api', 'campaign', 'admin'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet de modifier certaines informations d'une campagne.",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/campaigns/swap-codes',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        validate: {
          payload: Joi.object({
            firstCampaignId: identifiersType.campaignId,
            secondCampaignId: identifiersType.campaignId,
          }),
        },
        handler: campaignAdministrationController.swapCampaignCodes,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés ayant pour rôle SUPER_ADMIN**\n' +
            '- Échanger les codes de deux campagnes\n' +
            '- Elle ne retourne aucune valeur',
        ],
        tags: ['api', 'admin', 'campaigns'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/campaigns/{campaignId}/update-code',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        validate: {
          params: Joi.object({
            campaignId: identifiersType.campaignId,
          }),
          payload: Joi.object({
            campaignCode: Joi.string().trim().required(),
          }),
        },
        handler: campaignAdministrationController.updateCampaignCode,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés ayant pour rôle SUPER_ADMIN**\n' +
            "- Modifier le code d'une campagne\n" +
            '- Elle ne retourne aucune valeur',
        ],
        tags: ['api', 'admin', 'campaigns'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/campaigns/archive-campaigns',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAtLeastOneAccessOf',
          },
        ],
        payload: {
          maxBytes: MAX_FILE_SIZE_UPLOAD,
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
        handler: campaignAdministrationController.archiveCampaigns,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés ayant pour rôle METIER**\n' +
            "- Elle permet d'archiver une liste définis de campagne sous le format CSV\n" +
            '- Elle ne retourne aucune valeur de retour',
        ],
        tags: ['api', 'organization-learners'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/organizations/{organizationId}/campaigns',
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
            organizationId: identifiersType.organizationId,
          }),
          query: Joi.object({
            page: queriesType.paginationType,
          }),
        },
        handler: campaignAdministrationController.findPaginatedCampaignManagements,
        tags: ['api', 'organizations'],
        notes: [
          'Cette route est restreinte aux administrateurs authentifiés',
          'Elle retourne toutes les campagnes rattachées à l’organisation.',
        ],
      },
    },
    {
      method: 'DELETE',
      path: '/api/organizations/{organizationId}/campaigns',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserBelongsToOrganization,
          },
        ],
        validate: {
          params: Joi.object({
            organizationId: identifiersType.organizationId,
          }),
          payload: Joi.object({
            data: Joi.array()
              .required()
              .items(Joi.object({ type: Joi.string().required(), id: identifiersType.campaignId })),
          }),
        },
        handler: campaignAdministrationController.deleteCampaigns,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Suppression d'une ou plusieurs campagne(s)\n" +
            '- L‘utilisateur doit appartenir à l‘organisation',
        ],
        tags: ['api', 'orga', 'campaign'],
      },
    },
  ]);
};

export const campaignAdministrationRoute = { name: 'prescription/campaign/campaign-administration-api', register };
