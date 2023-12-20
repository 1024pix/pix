import Joi from 'joi';
import { campaignParticipationController } from './campaign-participation-controller.js';
import { securityPreHandlers } from '../security-pre-handlers.js';
import { identifiersType } from '../../domain/types/identifiers-type.js';

const register = async function (server) {
  server.route([
    {
      method: 'PATCH',
      path: '/api/campaign-participations/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.campaignParticipationId,
          }),
        },
        handler: campaignParticipationController.shareCampaignResult,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Partage de résultat de la campagne d‘un utilisateur, à son organisation',
        ],
        tags: ['api', 'campaign-participation'],
      },
    },
    {
      method: 'POST',
      path: '/api/campaign-participations',
      config: {
        validate: {
          payload: Joi.object({
            data: Joi.object({
              type: Joi.string(),
              attributes: Joi.object({
                'participant-external-id': Joi.string().allow(null).max(255),
                'is-retry': Joi.boolean().allow(null).default(false),
                'is-reset': Joi.boolean().allow(null).default(false),
              }).required(),
            }).required(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        handler: campaignParticipationController.save,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Création d‘une nouvelle participation à une campagne',
        ],
        tags: ['api', 'campaign-participation'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/campaign-participations/{id}/begin-improvement',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.campaignParticipationId,
          }),
        },
        handler: campaignParticipationController.beginImprovement,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Elle permet de progresser à la fin d'une participation à une campagne" +
            "- Le contenu de la requête n'est pas pris en compte.",
        ],
        tags: ['api', 'campaign-participation'],
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
      path: '/api/campaigns/{id}/assessment-results',
      config: {
        pre: [{ method: securityPreHandlers.checkAuthorizationToAccessCampaign }],
        validate: {
          params: Joi.object({
            id: identifiersType.campaignId,
          }),
          query: Joi.object({
            'filter[divisions][]': [Joi.string(), Joi.array().items(Joi.string())],
            'filter[groups][]': [Joi.string(), Joi.array().items(Joi.string())],
            'filter[badges][]': [Joi.number().integer(), Joi.array().items(Joi.number().integer())],
            'filter[stages][]': [Joi.number().integer(), Joi.array().items(Joi.number().integer())],
            'filter[search]': Joi.string().empty(''),
            'page[number]': Joi.number().integer().empty(''),
            'page[size]': Joi.number().integer().empty(''),
          }),
        },
        handler: campaignParticipationController.findAssessmentParticipationResults,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération des résultats d'une campagne d'évaluation",
        ],
        tags: ['api', 'campaign-assessment-participation-result-minimal'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/campaign-participations/{id}',
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
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
    {
      method: 'GET',
      path: '/api/campaign-participations/{id}/trainings',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.campaignParticipationId,
          }),
        },
        handler: campaignParticipationController.findTrainings,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération des formations de la campagne d‘un utilisateur',
        ],
        tags: ['api', 'campaign-participations', 'trainings'],
      },
    },
  ]);
};

const name = 'campaign-participations-api';
export { register, name };
