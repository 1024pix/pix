const Joi = require('joi');
const certificationIssueReportController = require('./certification-issue-report-controller');
const identifiersType = require('../../domain/types/identifiers-type');
const securityPreHandlers = require('../security-pre-handlers');

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
    {
      method: 'PATCH',
      path: '/api/certification-issue-reports/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationIssueReportId,
          }),
          payload: Joi.object({
            data: {
              resolution: Joi.string().max(255).allow(null).optional(),
            },
          }),
        },
        pre: [
          {
            method: securityPreHandlers.checkUserHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        handler: certificationIssueReportController.manuallyResolve,
        tags: ['api', 'certification-issue-reports'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs Super Admin authentifiés**\n',
          '- Elle permet de résoudre manuellement un signalement',
        ],
      },
    },
  ]);
};

exports.name = 'certification-issue-reports-api';
