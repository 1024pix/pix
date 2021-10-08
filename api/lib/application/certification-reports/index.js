const Joi = require('joi');
const certificationReportController = require('./certification-report-controller');
const identifiersType = require('../../domain/types/identifiers-type');
const authorization = require('../preHandlers/authorization');

exports.register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/certification-reports/{id}/certification-issue-reports',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationIssueReportId,
          }),
        },
        handler: certificationReportController.saveCertificationIssueReport,
        tags: ['api', 'certification-reports'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n',
          "- Elle permet d'enregistrer un signalement relevé par un surveillant sur la certification d'un candidat",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/certification-reports/{id}/abort',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCourseId,
          }),
        },
        pre: [
          {
            method: authorization.verifyCertificationSessionAuthorization,
            assign: 'authorizationCheck',
          },
        ],
        handler: certificationReportController.abort,
        tags: ['api'],
      },
    },
  ]);
};

exports.name = 'certification-reports-api';
