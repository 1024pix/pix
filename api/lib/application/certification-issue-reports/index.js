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
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.userHasAtLeastOneAccessOf([
                securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId,
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkUserHasRoleSupport,
                securityPreHandlers.checkUserHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.certificationIssueReportId,
          }),
        },
        handler: certificationIssueReportController.deleteCertificationIssueReport,
        tags: ['api', 'certification-issue-reports'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs qui sont membres de la session du centre de certification**\n',
          "ou à ceux avec un rôle sur l'application Pix Admin\n",
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
            method: (request, h) =>
              securityPreHandlers.userHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkUserHasRoleSupport,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: certificationIssueReportController.manuallyResolve,
        tags: ['api', 'certification-issue-reports'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n",
          '- Elle permet de résoudre manuellement un signalement',
        ],
      },
    },
  ]);
};

exports.name = 'certification-issue-reports-api';
