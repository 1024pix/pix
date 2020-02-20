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
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/assessments',
      config: {
        auth: false,
        handler: assessmentController.findByFilters,
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/assessments/{id}/next',
      config: {
        auth: false,
        handler: assessmentController.getNextChallenge,
        notes: [
          '- Récupération de la question suivante pour l\'évaluation donnée'
        ],
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/assessments/{id}',
      config: {
        auth: false,
        pre: [{
          method: assessmentAuthorization.verify,
          assign: 'authorizationCheck'
        }],
        handler: assessmentController.get,
        tags: ['api']
      }
    },
    {
      method: 'PATCH',
      path: '/api/assessments/{id}/complete-assessment',
      config: {
        auth: false,
        pre: [{
          method: assessmentAuthorization.verify,
          assign: 'authorizationCheck'
        }],
        handler: assessmentController.completeAssessment,
        tags: ['api']
      }
    }
  ]);
};

exports.name = 'assessments-api';
