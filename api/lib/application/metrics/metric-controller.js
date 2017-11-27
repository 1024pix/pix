
const { prometheusClient } = require('../../infrastructure/plugins/metrics');

module.exports = {
  get(request, reply) {
    const metricsStr = prometheusClient.metrics();

    return reply(metricsStr).type('text/plain');
  }
};
