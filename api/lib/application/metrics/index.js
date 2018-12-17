const metricController = require('./metric-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/metrics',
      config: {
        auth: false,
        handler: metricController.get,
        tags: ['metrics'] }
    }
  ]);
};

exports.name = 'metrics';
