import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { certificationIssueReportsController } from './certification-issue-reports-controller.js';
import { sessionManagementSecurityPreHandlers } from './security-pre-handlers.js';

const register = async function (server) {
  server.route([
    {
      method: 'DELETE',
      path: '/api/certification-issue-reports/{id}',
      config: {
        pre: [
          {
            method:
              sessionManagementSecurityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId,
            assign: 'hasAuthorizationToAccessSessionsOfCertificationCenters',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.certificationIssueReportId,
          }),
        },
        handler: certificationIssueReportsController.deleteCertification,
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
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: certificationIssueReportsController.manuallyResolve,
        tags: ['api', 'certification-issue-reports'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n",
          '- Elle permet de résoudre manuellement un signalement',
        ],
      },
    },
  ]);
};

export const certificationIssueReportsRoute = {
  name: 'certification/session-management/certification-issue-reports-api',
  register,
};
