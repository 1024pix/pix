const certificationCandidatesController = require('./certification-candidates-controller');
const assessmentSupervisorAuthorization = require('../preHandlers/assessment-supervisor-authorization');
const endTestScreenRemovalEnabled = require('../preHandlers/end-test-screen-removal-enabled');
const Joi = require('joi');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async function (server) {
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
            method: endTestScreenRemovalEnabled.verifyByCertificationCandidateId,
            assign: 'endTestScreenRemovalEnabledCheck',
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
            method: endTestScreenRemovalEnabled.verifyByCertificationCandidateId,
            assign: 'endTestScreenRemovalEnabledCheck',
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
        auth: false,
        pre: [
          {
            method: endTestScreenRemovalEnabled.verifyByCertificationCandidateId,
            assign: 'endTestScreenRemovalEnabledCheck',
          },
          {
            method: assessmentSupervisorAuthorization.verify,
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

exports.name = 'certification-candidates-api';
