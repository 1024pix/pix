const AssessmentResultController = require('./assessment-result-controller');
const securityPreHandlers = require('../security-pre-handlers');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/assessment-results',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: AssessmentResultController.save,
        tags: ['api']
      }
    },
  ]);
};

exports.name = 'assessments-results-api';
