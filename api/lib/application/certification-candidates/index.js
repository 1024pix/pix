import certificationCandidatesController from './certification-candidates-controller';
import assessmentSupervisorAuthorization from '../preHandlers/session-supervisor-authorization';
import Joi from 'joi';
import identifiersType from '../../domain/types/identifiers-type';

export const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/certification-candidates/{id}/authorize-to-start',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCandidateId,
          }),
          payload: Joi.object({
            'authorized-to-start': Joi.boolean().required(),
          }),
        },
        pre: [
          {
            method: assessmentSupervisorAuthorization.verifyByCertificationCandidateId,
            assign: 'authorizationCheck',
          },
        ],
        handler: certificationCandidatesController.authorizeToStart,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Indiquer la présence d'un candidat pour permettre ou bloquer son entrée en session",
        ],
        tags: ['api', 'certification-candidates'],
      },
    },
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
    {
      method: 'GET',
      path: '/api/certification-candidates/{id}/subscriptions',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCandidateId,
          }),
        },
        handler: certificationCandidatesController.getSubscriptions,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Renvoie les informations d'inscription et d'élligibilité au passage de certification complémentaires d'un candidat",
        ],
        tags: ['api', 'certification-candidates'],
      },
    },
  ]);
};

export const name = 'certification-candidates-api';
