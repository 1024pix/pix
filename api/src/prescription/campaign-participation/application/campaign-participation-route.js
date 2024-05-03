import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { campaignParticipationController } from './campaign-participation-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/campaigns/{campaignId}/participations',
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
            campaignId: identifiersType.campaignId,
          }),
          query: Joi.object({
            'page[number]': Joi.number().integer().empty(''),
            'page[size]': Joi.number().integer().empty(''),
          }),
        },
        handler: campaignParticipationController.findPaginatedParticipationsForCampaignManagement,
        tags: ['api', 'campaign', 'participations', 'admin'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet de récupérer les participations d'une campagne donnée.",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/campaign-participations/{id}/analyses',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.campaignParticipationId,
          }),
        },
        handler: campaignParticipationController.getAnalysis,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la participation à la campagne',
          "- Récupération de l'analyse d'un participant pour la participation à la campagne",
        ],
        tags: ['api', 'campaign-participation'],
      },
    },
    {
      method: 'DELETE',
      path: '/api/campaigns/{id}/campaign-participations/{campaignParticipationId}',
      config: {
        pre: [{ method: securityPreHandlers.checkAuthorizationToManageCampaign }],
        validate: {
          params: Joi.object({
            id: identifiersType.campaignId,
            campaignParticipationId: identifiersType.campaignParticipationId,
          }),
        },
        handler: campaignParticipationController.deleteParticipation,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés, administrateurs de l'espace Pix Orga ou gestionnaire de la campagne**\n" +
            '-Permet de supprimer une campaigne participation',
        ],
        tags: ['api', 'campaign-participation'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{campaignId}/profiles-collection-participations/{campaignParticipationId}',
      config: {
        validate: {
          params: Joi.object({
            campaignId: identifiersType.campaignId,
            campaignParticipationId: identifiersType.campaignParticipationId,
          }),
        },
        handler: campaignParticipationController.getCampaignProfile,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- L’utilisateur doit avoir les droits d‘accès à l‘organisation liée à la participation à la campagne\n' +
            '- Récupération du profil d’un participant pour la participation à la campagne',
        ],
        tags: ['api', 'campaign-participation'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{campaignId}/assessment-participations/{campaignParticipationId}',
      config: {
        validate: {
          params: Joi.object({
            campaignId: identifiersType.campaignId,
            campaignParticipationId: identifiersType.campaignParticipationId,
          }),
        },
        handler: campaignParticipationController.getCampaignAssessmentParticipation,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- L’utilisateur doit avoir les droits d‘accès à l‘organisation liée à la campagne\n' +
            '- Récupération de l’évaluation d’un participant pour la campagne donnée',
        ],
        tags: ['api', 'campaign-participation'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{campaignId}/assessment-participations/{campaignParticipationId}/results',
      config: {
        validate: {
          params: Joi.object({
            campaignId: identifiersType.campaignId,
            campaignParticipationId: identifiersType.campaignParticipationId,
          }),
        },
        handler: campaignParticipationController.getCampaignAssessmentParticipationResult,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- L’utilisateur doit avoir les droits d‘accès à l‘organisation liée à la campagne\n' +
            '- Récupération des résultats de l’évaluation d’un participant pour la campagne donnée',
        ],
        tags: ['api', 'campaign-participation'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{campaignId}/organization-learners/{organizationLearnerId}/participations',
      config: {
        pre: [{ method: securityPreHandlers.checkAuthorizationToAccessCampaign }],
        validate: {
          params: Joi.object({
            campaignId: identifiersType.campaignId,
            organizationLearnerId: identifiersType.organizationLearnerId,
          }),
        },
        handler: campaignParticipationController.getCampaignParticipationsForOrganizationLearner,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- L’utilisateur doit avoir les droits d‘accès à l‘organisation liée à la campagne\n' +
            '- Récupération de la liste des participations d’un learner à une campagne',
        ],
        tags: ['api', 'campaign-participation'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/campaign-participations/{id}',
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
            id: identifiersType.campaignParticipationId,
          }),
        },
        handler: campaignParticipationController.updateParticipantExternalId,
        tags: ['api', 'campaign', 'participations', 'admin'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs ayant accès à Pix Admin**\n' +
            "- Elle permet de mettre à jour l'identifaint externe d'une participation ",
        ],
      },
    },
    {
      method: 'DELETE',
      path: '/api/admin/campaign-participations/{id}',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.campaignParticipationId,
          }),
        },
        handler: campaignParticipationController.deleteCampaignParticipationForAdmin,
        notes: ['- Permet à un administrateur de supprimer une participation à une campagne'],
        tags: ['api', 'campaign-participations'],
      },
    },
  ]);
};

const name = 'campaign-participation-api';
export { name, register };
