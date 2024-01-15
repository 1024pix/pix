import Joi from 'joi';
import { certificationIssueReportController } from './certification-issue-report-controller.js';
import { identifiersType } from '../../domain/types/identifiers-type.js';
import { securityPreHandlers } from '../security-pre-handlers.js';

const register = async function (server) {
  server.route([
    {
      method: 'DELETE',
      path: '/api/certification-issue-reports/{id}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId,
            assign: 'hasAuthorizationToAccessSessionsOfCertificationCenters',
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
          '- **Cette route est restreinte aux utilisateurs qui sont membres du centre de certification**\n',
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
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
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

const name = 'certification-issue-reports-api';
export { register, name };
