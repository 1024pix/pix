const assessmentController = require('./assessment-controller');
const assessmentAuthorization = require('../preHandlers/assessment-authorization');
const securityController = require('../../interfaces/controllers/security-controller');

exports.register = function(server, options, next) {

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
      method: 'POST',
      path: '/api/assessments/{assessmentId}/{assessmentResultId}',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: assessmentController.computeCompetenceMarksForAssessmentResult,
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/assessments',
      config: {
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

  return next();
};

exports.register.attributes = {
  name: 'assessments-api',
  version: '1.0.0'
};
