import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { authorization } from '../../shared/application/pre-handlers/authorization.js';
import { sessionController } from './session-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/certification-centers/{certificationCenterId}/session',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsMemberOfCertificationCenter,
            assign: 'isMemberOfCertificationCenter',
          },
        ],
        validate: {
          options: {
            allowUnknown: true,
          },
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
          }),
          payload: Joi.object({
            data: {
              attributes: {
                address: Joi.string().required(),
                room: Joi.string().required(),
                date: Joi.date().format('YYYY-MM-DD').required().empty(['', null]),
                time: Joi.string()
                  .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
                  .required(),
                examiner: Joi.string().required(),
                description: Joi.string().optional().allow(null, ''),
              },
            },
          }),
        },
        handler: sessionController.createSession,
        tags: ['api', 'certification-center', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Elle permet de créer une session de certification liée au centre de certification de l’utilisateur',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/sessions/{sessionId}',
      config: {
        pre: [
          {
            method: authorization.verifySessionAuthorization,
            assign: 'authorizationCheck',
          },
        ],
        handler: sessionController.get,
        validate: {
          params: Joi.object({ sessionId: identifiersType.sessionId }),
        },
        tags: ['api', 'sessions', 'session enrolment'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés membre du centre de certification lié à la session **\n' +
            '- Elle permet de récupérer la session',
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/sessions/{sessionId}',
      config: {
        validate: {
          options: {
            allowUnknown: true,
          },
          params: Joi.object({
            sessionId: identifiersType.sessionId,
          }),
          payload: Joi.object({
            data: {
              attributes: {
                address: Joi.string().required(),
                room: Joi.string().required(),
                date: Joi.date().format('YYYY-MM-DD').required().empty(['', null]),
                time: Joi.string()
                  .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
                  .required(),
                examiner: Joi.string().required(),
                description: Joi.string().optional().allow(null, ''),
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
        handler: sessionController.update,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Modification d'une session de certification\n" +
            '- L‘utilisateur doit avoir les droits d‘accès au centre de certification lié à la session à modifier',
        ],
        tags: ['api', 'session'],
      },
    },
    {
      method: 'DELETE',
      path: '/api/sessions/{sessionId}',
      config: {
        validate: {
          params: Joi.object({
            sessionId: identifiersType.sessionId,
          }),
        },
        pre: [
          {
            method: authorization.verifySessionAuthorization,
            assign: 'authorizationCheck',
          },
        ],
        handler: sessionController.remove,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès au centre de certification**\n" +
            "- Supprime la session et les candidats si la session n'a pas démarrée",
        ],
        tags: ['api', 'session'],
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
        handler: sessionController.createCandidateParticipation,
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

export const sessionRoute = { name: 'certification/enrolment/certification-enrollment-api', register };
