
const { prometheusClient } = require('../../infrastructure/plugins/metrics');

module.exports = {
  get(request, h) {
    const metricsStr = prometheusClient.metrics();

    return h.response(metricsStr).type('text/plain');
  }
};
