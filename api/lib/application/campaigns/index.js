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
        handler: campaignController.getCsvResults,
        notes: [
          '- **Cette route est restreinte via un token dédié passé en paramètre avec l\'id de l\'utilisateur.**\n' +
          '- Récupération d\'un CSV avec les résultats de la campagne\n' +
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
          '- Récupération d\'une campaign-collective-result par l\'id de campagne',
        ],
        tags: ['api', 'campaign']
      }
    },

  ]);
};

exports.name = 'campaigns-api';
