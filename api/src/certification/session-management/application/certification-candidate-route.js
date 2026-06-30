import JoiDate from '@joi/date';
import BaseJoi from 'joi';

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { assessmentInvigilatorAuthorization } from '../../shared/application/pre-handlers/session-invigilator-authorization.js';
import { certificationCandidateController } from './certification-candidate-controller.js';

const Joi = BaseJoi.extend(JoiDate);

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/certification-candidates/{certificationCandidateId}/authorize-to-start',
      config: {
        validate: {
          params: Joi.object({
            certificationCandidateId: identifiersType.certificationCandidateId,
          }),
          payload: Joi.object({
            'authorized-to-start': Joi.boolean().required(),
          }),
        },
        pre: [
          {
            method: assessmentInvigilatorAuthorization.verifyByCertificationCandidateId,
            assign: 'authorizationCheck',
          },
        ],
        handler: certificationCandidateController.authorizeToStart,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Indiquer la présence d'un candidat pour permettre ou bloquer son entrée en session",
        ],
        tags: ['api', 'certification-candidates'],
      },
    },
    {
      method: 'POST',
      path: '/api/certification-candidates/{certificationCandidateId}/authorize-to-resume',
      config: {
        validate: {
          params: Joi.object({
            certificationCandidateId: identifiersType.certificationCandidateId,
          }),
        },
        pre: [
          {
            method: assessmentInvigilatorAuthorization.verifyByCertificationCandidateId,
            assign: 'authorizationCheck',
          },
        ],
        handler: certificationCandidateController.authorizeToResume,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Autoriser la reprise du test par le candidat',
        ],
        tags: ['api', 'certification-candidates'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/certification-candidates/{certificationCandidateId}/end-assessment-by-invigilator',
      config: {
        pre: [
          {
            method: assessmentInvigilatorAuthorization.verifyByCertificationCandidateId,
            assign: 'authorizationCheck',
          },
        ],
        validate: {
          params: Joi.object({
            certificationCandidateId: identifiersType.certificationCandidateId,
          }),
        },
        handler: certificationCandidateController.endAssessmentByInvigilator,
        tags: ['api'],
      },
    },
  ]);
};

export const certificationCandidateRoute = {
  name: 'certification/session-management/certification-candidate-api',
  register,
};
