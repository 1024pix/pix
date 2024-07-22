import Joi from 'joi';

import { assessmentSupervisorAuthorization } from '../../../src/certification/shared/application/pre-handlers/session-supervisor-authorization.js';
import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';
import { certificationCandidatesController } from './certification-candidates-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/certification-candidates/{id}/authorize-to-resume',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCandidateId,
          }),
        },
        pre: [
          {
            method: assessmentSupervisorAuthorization.verifyByCertificationCandidateId,
            assign: 'authorizationCheck',
          },
        ],
        handler: certificationCandidatesController.authorizeToResume,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Autoriser la reprise du test par le candidat',
        ],
        tags: ['api', 'certification-candidates'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/certification-candidates/{id}/end-assessment-by-supervisor',
      config: {
        pre: [
          {
            method: assessmentSupervisorAuthorization.verifyByCertificationCandidateId,
            assign: 'authorizationCheck',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCandidateId,
          }),
        },
        handler: certificationCandidatesController.endAssessmentBySupervisor,
        tags: ['api'],
      },
    },
  ]);
};

const name = 'certification-candidates-api';
export { name, register };
