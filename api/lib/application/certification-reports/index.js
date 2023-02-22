import Joi from 'joi';
import certificationReportController from './certification-report-controller';
import identifiersType from '../../domain/types/identifiers-type';
import authorization from '../preHandlers/authorization';
import securityPreHandlers from '../security-pre-handlers';

export const register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/certification-reports/{id}/certification-issue-reports',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId,
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCourseId,
          }),
        },
        handler: certificationReportController.saveCertificationIssueReport,
        tags: ['api', 'certification-reports'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs qui sont membres de la session du centre de certification**\n',
          "ou à ceux avec un rôle sur l'application Pix Admin\n",
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

export const name = 'certification-reports-api';
