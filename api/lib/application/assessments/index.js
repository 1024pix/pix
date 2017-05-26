const AssessmentController = require('./assessment-controller');

exports.register = function(server, options, next) {

  server.route([

    {
      method: 'POST',
      path: '/api/assessments',
      config: { handler: AssessmentController.save, tags: ['api'] }
    },
    {
      method: 'GET',
      path: '/api/assessments/{id}/next',
      config: { handler: AssessmentController.getNextChallenge, tags: ['api'] }
    },
    {
      method: 'GET',
      path: '/api/assessments/{id}/next/{challengeId}',
      config: { handler: AssessmentController.getNextChallenge, tags: ['api'] }
    },
    {
      method: 'GET',
      path: '/api/assessments/{id}',
      config: { handler: AssessmentController.get, tags: ['api'] }
    },
    {
      method: 'GET',
      path: '/api/assessments/{id}/solutions/{answerId}',
      config: { handler: AssessmentController.getAssessmentSolutions, tags: ['api'] }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'assessments-api',
  version: '1.0.0'
};
