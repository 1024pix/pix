
const metricController = require('./metric-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/metrics',
      config: { handler: metricController.get, tags: ['api'] }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'metrics',
  version: '1.0.0'
};
