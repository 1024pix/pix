const certificationReportController = require('./certification-report-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/certification-reports/{id}/certification-issue-reports',
      config: {
        handler: certificationReportController.saveCertificationIssueReport,
        tags: ['api', 'certification-reports'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n',
          '- Elle permet d\'enregistrer un signalement relevé par un surveillant sur la certification d\'un candidat',
        ],
      },
    },
  ]);
};

exports.name = 'certification-reports-api';
