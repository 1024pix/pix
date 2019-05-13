const campaignCollectiveResultsController = require('./campaign-collective-results-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/campaigns/{id}/collective-results',
      config: {
        handler: campaignCollectiveResultsController.get,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération d\'une campaign-collective-result par l\'id de campagne',
        ],
        tags: ['api', 'campaign-collective-results']
      }
    }
  ]);
};

exports.name = 'campaign-collective-results-api';
