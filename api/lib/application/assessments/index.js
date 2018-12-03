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
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/assessments/{id}/next/{challengeId}',
      config: {
        auth: false,
        handler: assessmentController.getNextChallenge,
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
    }
  ]);
};

exports.name = 'assessments-api';
