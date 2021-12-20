const Joi = require('joi');
const assessmentController = require('./assessment-controller');
const securityPreHandlers = require('../security-pre-handlers');
const assessmentAuthorization = require('../preHandlers/assessment-authorization');
const assessmentSupervisorAuthorization = require('../preHandlers/assessment-supervisor-authorization');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/assessments',
      config: {
        auth: false,
        handler: assessmentController.save,
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/assessments',
      config: {
        auth: false,
        handler: assessmentController.findByFilters,
        tags: ['api'],
        notes: ['route désormais non utilisée et donc dépréciée'],
      },
    },
    {
      method: 'GET',
      path: '/api/assessments/{id}/next',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.assessmentId,
          }),
        },
        handler: assessmentController.getNextChallenge,
        notes: ["- Récupération de la question suivante pour l'évaluation donnée"],
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/assessments/{id}',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.assessmentId,
          }),
        },
        pre: [
          {
            method: assessmentAuthorization.verify,
            assign: 'authorizationCheck',
          },
        ],
        handler: assessmentController.get,
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/assessments/{id}/last-challenge-id',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserHasRolePixMaster,
            assign: 'hasRolePixMaster',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.assessmentId,
          }),
        },
        handler: assessmentController.getLastChallengeId,
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/assessments/{id}/challenge-for-pix-auto-answer',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserHasRolePixMaster,
            assign: 'hasRolePixMaster',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.assessmentId,
          }),
        },
        handler: assessmentController.getChallengeForPixAutoAnswer,
        tags: ['api'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/assessments/{id}/complete-assessment',
      config: {
        auth: false,
        pre: [
          {
            method: assessmentAuthorization.verify,
            assign: 'authorizationCheck',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.assessmentId,
          }),
        },
        handler: assessmentController.completeAssessment,
        tags: ['api'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/assessments/{id}/end-assessment-by-supervisor',
      config: {
        auth: false,
        pre: [
          {
            method: assessmentSupervisorAuthorization.verify,
            assign: 'authorizationCheck',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.assessmentId,
          }),
        },
        handler: assessmentController.endAssessmentBySupervisor,
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/assessments/{id}/competence-evaluations',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.assessmentId,
          }),
        },
        handler: assessmentController.findCompetenceEvaluations,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération des competence-evaluations d'un assessment",
        ],
        tags: ['api', 'competence-evaluations'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/assessments/{id}/last-challenge-state/{state}',
      config: {
        auth: false,
        pre: [
          {
            method: assessmentAuthorization.verify,
            assign: 'authorizationCheck',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.assessmentId,
            state: Joi.string().valid('asked', 'timeout', 'focusedout'),
          }),
        },
        handler: assessmentController.updateLastChallengeState,
        notes: ["- Modifie l'état de la dernière question posée\n" + "- L'état doit être indiqué en paramètres."],
        tags: ['api', 'assessments'],
      },
    },
  ]);
};

exports.name = 'assessments-api';
