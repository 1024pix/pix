const Joi = require('@hapi/joi');
const campaignParticipationController = require('./campaign-participation-controller');
const { sendJsonApiError, NotFoundError } = require('../http-errors');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/campaign-participations',
      config: {
        handler: campaignParticipationController.find,
        validate: {
          query: Joi.object({
            'filter[assessmentId]': Joi.string().pattern(/^[0-9]+$/),
          }).options({ allowUnknown: true }),
          failAction: (request, h) => {
            return sendJsonApiError(new NotFoundError(), h);
          },
        },
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des campaign-participation par assessment',
        ],
        tags: ['api', 'campaign-participation'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaign-participations/{id}',
      config: {
        handler: campaignParticipationController.getById,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération d\'une campaign-participation par son id',
        ],
        tags: ['api', 'campaign-participation'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/campaign-participations/{id}',
      config: {
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
        handler: campaignParticipationController.beginImprovement,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Elle permet de progresser à la fin d\'une participation à une campagne' +
          '- Le contenu de la requête n\'est pas pris en compte.',
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
            id: Joi.number().integer().required(),
          }),
        },
        handler: campaignParticipationController.getAnalysis,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la participation à la campagne',
          '- Récupération de l\'analyse d\'un participant pour la participation à la campagne',
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
            campaignId: Joi.number().integer().required(),
            campaignParticipationId: Joi.number().integer().required(),
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
            campaignId: Joi.number().integer().required(),
            campaignParticipationId: Joi.number().integer().required(),
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
            campaignId: Joi.number().integer().required(),
            campaignParticipationId: Joi.number().integer().required(),
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
  ]);
};

exports.name = 'campaign-participations-api';
