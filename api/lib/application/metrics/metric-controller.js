
const { metrics } = require('../../infrastructure/plugins/metrics');

module.exports = {
  get(request, reply) {
    const metricsStr = metrics.metrics();

    return reply(metricsStr).type('text/plain');
  }
};
