const AssessmentResultController = require('./assessment-result-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/admin/assessment-results',
      config: { handler: AssessmentResultController.save, tags: ['api'] }
    },
    {
      method: 'POST',
      path: '/api/assessment-results',
      config: { handler: AssessmentResultController.evaluate, tags: ['api'] }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'assessments-results-api',
  version: '1.0.0'
};
