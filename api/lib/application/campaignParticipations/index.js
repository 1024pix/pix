const campaignParticipationController = require('./campaign-participation-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'PATCH',
      path: '/api/campaign-participations/{assessmentId}',
      config: {
        handler: campaignParticipationController.shareCampaignResult,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Partage de résultat de la campagne d‘un utilisateur, à son organisation',
        ],
        tags: ['api', 'campaign']
      }
    },
  ]);

  return next();

};

exports.register.attributes = {
  name: 'campaign-participations-api',
  version: '1.0.0'
};
