const AssessmentResultController = require('./assessment-result-controller');
const securityController = require('../security-controller');

exports.register = async function(server) {
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
  ]);
};

exports.name = 'assessments-results-api';
