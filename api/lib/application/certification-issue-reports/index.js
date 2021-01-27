const Joi = require('joi');
const certificationIssueReportController = require('./certification-issue-report-controller');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async (server) => {
  server.route([
    {
      method: 'DELETE',
      path: '/api/certification-issue-reports/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationIssueReportId,
          }),
        },
        handler: certificationIssueReportController.deleteCertificationIssueReport,
        tags: ['api', 'certification-issue-reports'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n',
          '- Elle permet de supprimer un signalement',
        ],
      },
    },
  ]);
};

exports.name = 'certification-issue-reports-api';
