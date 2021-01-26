const Joi = require('joi');
const assessmentController = require('./assessment-controller');
const assessmentAuthorization = require('../preHandlers/assessment-authorization');

exports.register = async function(server) {
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
      },
    },
    {
      method: 'GET',
      path: '/api/assessments/{id}/next',
      config: {
        auth: false,
        handler: assessmentController.getNextChallenge,
        notes: [
          '- Récupération de la question suivante pour l\'évaluation donnée',
        ],
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/assessments/{id}',
      config: {
        auth: false,
        pre: [{
          method: assessmentAuthorization.verify,
          assign: 'authorizationCheck',
        }],
        handler: assessmentController.get,
        tags: ['api'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/assessments/{id}/complete-assessment',
      config: {
        auth: false,
        pre: [{
          method: assessmentAuthorization.verify,
          assign: 'authorizationCheck',
        }],
        handler: assessmentController.completeAssessment,
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/assessments/{id}/competence-evaluations',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
        },
        handler: assessmentController.findCompetenceEvaluations,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des competence-evaluations d\'un assessment',
        ],
        tags: ['api', 'competence-evaluations'],
      },
    },
  ]);
};

exports.name = 'assessments-api';
