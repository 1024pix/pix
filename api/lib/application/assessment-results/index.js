const AssessmentResultController = require('./assessment-result-controller');
const securityController = require('../../interfaces/controllers/security-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/admin/assessment-results',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: AssessmentResultController.save,
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/api/assessment-results',
      config: {
        auth: false,
        handler: AssessmentResultController.evaluate,
        tags: ['api']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'assessments-results-api',
  version: '1.0.0'
};
