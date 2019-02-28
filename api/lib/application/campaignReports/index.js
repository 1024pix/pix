const campaignReportController = require('./campaign-report-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/campaigns/{id}/campaign-report',
      config: {
        handler: campaignReportController.get,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération du rapport d\'une campagne',
        ],
        tags: ['api', 'campaign-report']
      }
    },
  ]);
};

exports.name = 'campaign-report-api';
