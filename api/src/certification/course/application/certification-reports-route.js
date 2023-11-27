import Joi from 'joi';
import { authorization } from '../../../../lib/application/preHandlers/authorization.js';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';
import { certificationReportsController } from './certification-reports-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/sessions/{id}/certification-reports',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
          }),
        },
        pre: [
          {
            method: authorization.verifySessionAuthorization,
            assign: 'authorizationCheck',
          },
        ],
        handler: certificationReportsController.getCertificationReports,
        tags: ['api', 'sessions', 'certification-reports'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          "Elle retourne des infos sur les certifications d'une session.",
        ],
      },
    },
  ]);
};

const name = 'certification-reports';
export { register, name };
