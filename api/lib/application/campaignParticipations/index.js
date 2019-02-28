const campaignParticipationController = require('./campaign-participation-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/campaign-participations',
      config: {
        handler: campaignParticipationController.find,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération d\'un campaign-participation en fonction de son assessment',
        ],
        tags: ['api', 'campaign-participation']
      }
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
        tags: ['api', 'campaign-participation']
      }
    },
    {
      method: 'POST',
      path: '/api/campaign-participations',
      config: {
        handler: campaignParticipationController.save,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Création d‘une nouvelle participation à une campagne'
        ],
        tags: ['api', 'campaign-participation']
      }
    }
  ]);
};

exports.name = 'campaign-participations-api';
