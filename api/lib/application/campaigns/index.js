const Joi = require('joi');
const campaignController = require('./campaign-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/campaigns',
      config: {
        handler: campaignController.save,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Création d‘une nouvelle campagne\n' +
          '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la campagne à créer',
        ],
        tags: ['api', 'campaign'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns',
      config: {
        auth: false,
        handler: campaignController.getByCode,
        notes: [
          '- Récupération de la campagne dont le code est spécifié dans les filtres de la requête',
        ],
        tags: ['api', 'campaign'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
        },
        handler: campaignController.getById,
        notes: [
          '- Récupération d\'une campagne par son id',
        ],
        tags: ['api', 'campaign'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/csv-assessment-results',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
        },
        handler: campaignController.getCsvAssessmentResults,
        notes: [
          '- **Cette route est restreinte via un token dédié passé en paramètre avec l\'id de l\'utilisateur.**\n' +
          '- Récupération d\'un CSV avec les résultats de la campagne d‘évaluation\n' +
          '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la campagne à créer',
        ],
        tags: ['api', 'campaign'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/csv-profiles-collection-results',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
        },
        handler: campaignController.getCsvProfilesCollectionResults,
        notes: [
          '- **Cette route est restreinte via un token dédié passé en paramètre avec l\'id de l\'utilisateur.**\n' +
          '- Récupération d\'un CSV avec les résultats de la campagne de collecte de profils\n' +
          '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la campagne à créer',
        ],
        tags: ['api', 'campaign'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/campaigns/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
        },
        handler: campaignController.update,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Modification d\'une campagne\n' +
          '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la campagne à modifier',
        ],
        tags: ['api', 'campaign'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/collective-results',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
        },
        handler: campaignController.getCollectiveResult,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des résultats collectifs de la campagne par son id',
        ],
        tags: ['api', 'campaign'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/analyses',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
        },
        handler: campaignController.getAnalysis,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération de l\'analyse de la campagne par son id',
        ],
        tags: ['api', 'campaign'],
      },
    },
    {
      method: 'PUT',
      path: '/api/campaigns/{id}/archive',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
        },
        handler: campaignController.archiveCampaign,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Archivage d\'une campagne par son id',
        ],
      },
    },
    {
      method: 'DELETE',
      path: '/api/campaigns/{id}/archive',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
        },
        handler: campaignController.unarchiveCampaign,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Désarchivage d\'une campagne par son id',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/profiles-collection-participations',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
          query: Joi.object({
            'filter[divisions][]': [Joi.string(), Joi.array().items(Joi.string())],
            'page[number]': Joi.number().integer().empty(''),
            'page[size]': Joi.number().integer().empty(''),
          }),
        },
        handler: campaignController.findProfilesCollectionParticipations,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des profils collectés d\'une campagne par son id',
        ],
        tags: ['api', 'campaign'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/assessment-participations',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
          query: Joi.object({
            'filter[divisions][]': [Joi.string(), Joi.array().items(Joi.string())],
            'filter[badges][]': [Joi.number().integer(), Joi.array().items(Joi.number().integer())],
            'page[number]': Joi.number().integer().empty(''),
            'page[size]': Joi.number().integer().empty(''),
          }),
        },
        handler: campaignController.findAssessmentParticipations,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des campaign-assessment-participation-summaries par campagne',
        ],
        tags: ['api', 'campaign-assessment-participation-summary'],
      },
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/divisions',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
        },
        handler: campaignController.division,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des classes des participants à la campagne',
        ],
        tags: ['api', 'division'],
      },
    },
  ]);
};

exports.name = 'campaigns-api';
