import Joi from 'joi';
import { certificationReportController } from './certification-report-controller.js';
import { identifiersType } from '../../domain/types/identifiers-type.js';
import { authorization } from '../preHandlers/authorization.js';
import { securityPreHandlers } from '../security-pre-handlers.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/certification-reports/{id}/certification-issue-reports',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId,
            assign: 'hasAuthorizationToAccessSessionsOfCertificationCenters',
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
          '- **Cette route est restreinte aux utilisateurs qui sont membres du centre de certification**\n',
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

const name = 'certification-reports-api';
export { register, name };
