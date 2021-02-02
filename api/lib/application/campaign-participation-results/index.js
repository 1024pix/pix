const campaignParticipationResultController = require('./campaign-participation-result-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/campaign-participations/{id}/campaign-participation-result',
      config: {
        handler: campaignParticipationResultController.get,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération du résultat d\'une participation à une campagne',
        ],
        tags: ['api', 'campaign-participation-result'],
      },
    },
  ]);
};

exports.name = 'campaign-participation-result-api';
