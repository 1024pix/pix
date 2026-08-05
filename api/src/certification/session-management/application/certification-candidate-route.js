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
    {
      method: 'POST',
      path: '/api/sessions/{sessionId}/candidate-participation',
      config: {
        validate: {
          params: Joi.object({
            sessionId: identifiersType.sessionId,
          }),
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              type: Joi.string().valid('certification-candidates').required(),
              attributes: Joi.object({
                'first-name': Joi.string().empty(['', null]).required(),
                'last-name': Joi.string().empty(['', null]).required(),
                birthdate: Joi.date().format('YYYY-MM-DD').raw().required(),
              }),
            },
          }),
        },
        handler: certificationCandidateController.createCandidateParticipation,
        tags: ['api', 'sessions', 'certification-candidates'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle associe un candidat de certification\n' +
            "à un utilisateur à l'aide des informations d'identité de celui-ci (nom, prénom et date de naissance).",
        ],
      },
    },
  ]);
};

export const certificationCandidateRoute = {
  name: 'certification/session-management/certification-candidate-api',
  register,
};
