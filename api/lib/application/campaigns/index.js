const campaignController = require('./campaign-controller');

exports.register = function(server, options, next) {

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
      path: '/api/campaigns/campaign-participation/{assessmentId}',
      config: {
        handler: campaignController.shareCampaignResult,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Partage de résultat de la campagne d‘un utilisateur, à son organisation',
        ],
        tags: ['api', 'campaign']
      }
    }
  ]);

  return next();

};

exports.register.attributes = {
  name: 'campaigns-api',
  version: '1.0.0'
};
