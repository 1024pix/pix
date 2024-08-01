import JoiDate from '@joi/date';
import BaseJoi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { authorization } from '../../shared/application/pre-handlers/authorization.js';
import { certificationCandidateController } from './certification-candidate-controller.js';

const Joi = BaseJoi.extend(JoiDate);

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/sessions/{id}/certification-candidates',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
          }),
          payload: Joi.object({
            data: {
              type: Joi.string().valid('certification-candidates').required(),
              attributes: {
                'complementary-certification': Joi.object()
                  .keys({
                    id: Joi.number().required(),
                    key: Joi.string(),
                    label: Joi.string(),
                  })
                  .optional(),
                'first-name': Joi.string().empty(['', null]).required(),
                'last-name': Joi.string().empty(['', null]).required(),
                'birth-city': Joi.string().empty(['', null]),
                'birth-province-code': Joi.string().empty(['', null]),
                'birth-country': Joi.string().empty(['', null]),
                'birth-postal-code': Joi.string().empty(['', null]),
                'birth-insee-code': Joi.string().empty(['', null]),
                'result-recipient-email': Joi.string().empty(['', null]),
                'external-id': Joi.string().empty(['', null]),
                'extra-time-percentage': Joi.number().empty([null]),
                'billing-mode': Joi.string().empty(['', null]),
                'prepayment-code': Joi.string().empty(['', null]),
                'is-linked': Joi.boolean().valid(false).optional(),
                sex: Joi.string().empty(['', null]).required(),
                email: Joi.string().empty(['', null]),
                birthdate: Joi.date().format('YYYY-MM-DD').raw().required().messages({
                  'date.format': 'CANDIDATE_BIRTHDATE_FORMAT_NOT_VALID',
                }),
                'organization-learner-id': Joi.number().empty(null).forbidden(),
              },
            },
          }),
        },
        pre: [
          {
            method: authorization.verifySessionAuthorization,
            assign: 'authorizationCheck',
          },
        ],
        handler: certificationCandidateController.addCandidate,
        tags: ['api', 'sessions', 'certification-candidates', 'deprecated'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle ajoute un candidat de certification à la session.',
          'Cette route est dépréciée',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/sessions/{id}/certification-candidates',
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
        handler: certificationCandidateController.getEnrolledCandidates,
        tags: ['api', 'sessions', 'certification-candidates'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle retourne les candidats de certification inscrits à la session.',
        ],
      },
    },
    {
      method: 'DELETE',
      path: '/api/sessions/{id}/certification-candidates/{certificationCandidateId}',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.sessionId,
            certificationCandidateId: identifiersType.certificationCandidateId,
          }),
        },
        pre: [
          {
            method: authorization.verifySessionAuthorization,
            assign: 'authorizationCheck',
          },
        ],
        handler: certificationCandidateController.deleteCandidate,
        tags: ['api', 'sessions', 'certification-candidates'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle supprime un candidat de certification à la session.',
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/certification-candidates/{certificationCandidateId}/validate-certification-instructions',
      config: {
        validate: {
          params: Joi.object({
            certificationCandidateId: identifiersType.certificationCandidateId,
          }),
        },
        pre: [
          {
            method: securityPreHandlers.checkUserIsCandidate,
            assign: 'authorizationCheck',
          },
        ],
        handler: certificationCandidateController.validateCertificationInstructions,
        tags: ['api', 'certification-candidates'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle permet à un candidat de valider les instructions de certification',
        ],
      },
    },
  ]);
};

const name = 'certification-candidate';
export { name, register };
