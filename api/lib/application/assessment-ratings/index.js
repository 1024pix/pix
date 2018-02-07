const AssessmentRatingController = require('./assessment-rating-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/assessment-ratings',
      config: { handler: AssessmentRatingController.evaluate, tags: ['api'] }
    },
  ]);

  return next();
};

exports.register.attributes = {
  name: 'assessments-rating-api',
  version: '1.0.0'
};
