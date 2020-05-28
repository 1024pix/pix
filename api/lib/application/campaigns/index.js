const Joi = require('@hapi/joi');
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
        tags: ['api', 'campaign']
      }
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
        tags: ['api', 'campaign']
      }
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}',
      config: {
        handler: campaignController.getById,
        notes: [
          '- Récupération d\'une campagne par son id',
        ],
        tags: ['api', 'campaign']
      }
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/csvResults',
      config: {
        auth: false,
        handler: campaignController.getCsvAssessmentResults,
        notes: [
          '- **Cette route est restreinte via un token dédié passé en paramètre avec l\'id de l\'utilisateur.**\n' +
          '- Récupération d\'un CSV avec les résultats de la campagne\n' +
          '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la campagne à créer\n' +
          '- L‘usage de cette route est dépréciée'
        ],
        tags: ['api', 'campaign']
      }
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/csv-assessment-results',
      config: {
        auth: false,
        handler: campaignController.getCsvAssessmentResults,
        notes: [
          '- **Cette route est restreinte via un token dédié passé en paramètre avec l\'id de l\'utilisateur.**\n' +
          '- Récupération d\'un CSV avec les résultats de la campagne d‘évaluation\n' +
          '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la campagne à créer',
        ],
        tags: ['api', 'campaign']
      }
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/csv-profiles-collection-results',
      config: {
        auth: false,
        handler: campaignController.getCsvProfilesCollectionResults,
        notes: [
          '- **Cette route est restreinte via un token dédié passé en paramètre avec l\'id de l\'utilisateur.**\n' +
          '- Récupération d\'un CSV avec les résultats de la campagne de collecte de profils\n' +
          '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la campagne à créer',
        ],
        tags: ['api', 'campaign']
      }
    },
    {
      method: 'PATCH',
      path: '/api/campaigns/{id}',
      config: {
        handler: campaignController.update,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Modification d\'une campagne\n' +
          '- L‘utilisateur doit avoir les droits d‘accès à l‘organisation liée à la campagne à modifier',
        ],
        tags: ['api', 'campaign']
      }
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/campaign-report',
      config: {
        handler: campaignController.getReport,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération du rapport d\'une campagne',
        ],
        tags: ['api', 'campaign']
      }
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/collective-results',
      config: {
        handler: campaignController.getCollectiveResult,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des résultats collectifs de la campagne par son id',
        ],
        tags: ['api', 'campaign']
      }
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/analyses',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required()
          }),
        },
        handler: campaignController.getAnalysis,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération de l\'analyse de la campagne par son id',
        ],
        tags: ['api', 'campaign']
      }
    },
    {
      method: 'PUT',
      path: '/api/campaigns/{id}/archive',
      config: {
        handler: campaignController.archiveCampaign,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Archivage d\'une campagne par son id',
        ],
      }
    },
    {
      method: 'DELETE',
      path: '/api/campaigns/{id}/archive',
      config: {
        handler: campaignController.unarchiveCampaign,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Désarchivage d\'une campagne par son id',
        ],
      }
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/profiles-collection/participations',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required()
          }),
        },
        handler: campaignController.findProfilesCollectionParticipations,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des profils collectés d\'une campagne par son id',
        ],
        tags: ['api', 'campaign']
      }
    },
    {
      method: 'GET',
      path: '/api/campaigns/{id}/assessment-participations',
      config: {
        handler: campaignController.findAssessmentParticipations,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des campaign-assessment-participation-summaries par campagne',
        ],
        tags: ['api', 'campaign-assessment-participation-summary']
      }
    },
  ]);
};

exports.name = 'campaigns-api';
