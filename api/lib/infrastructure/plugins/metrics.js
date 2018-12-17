const client = require('prom-client');
const os = require('os');

client.register.clear(); // XXX test:watch force us to clean the registry

client.register.setDefaultLabels({ instance: os.hostname() });
client.collectDefaultMetrics();

const metrics = {
  request: {
    total: new client.Counter({ name: 'api_request_total', help: 'The total number of all API responses' }),
    success: new client.Counter({ name: 'api_request_success', help: 'The number of successful API responses', labelNames: [ 'path' ] }),
    server_error: new client.Counter({ name: 'api_request_server_error', help: 'The number of 50x API responses', labelNames: [ 'path' ] }),
    client_error: new client.Counter({ name: 'api_request_client_error', help: 'The number of 40x API responses', labelNames: [ 'path' ] }),
    api_request_duration: new client.Summary({
      name: 'api_request_duration',
      help: 'Summary of request duration per API endpoint',
      labelNames: [ 'path' ]
    })
  }
};

const Metrics = {
  name: 'metrics-plugin',

  reset() {
    metrics.request.total.reset();
    metrics.request.success.reset();
    metrics.request.server_error.reset();
    metrics.request.client_error.reset();
    metrics.request.api_request_duration.reset();
  },

  register(server) {

    server.events.on('response', (request) => {

      const responseDuration = request.info.responded - request.info.received;
      metrics.request.api_request_duration.observe(responseDuration);
      metrics.request.api_request_duration.observe({ 'path': request.route.path }, responseDuration);

      metrics.request.total.inc();

      const { statusCode } = request.response;

      if (statusCode < 400) {
        metrics.request.success.inc({ 'path': request.route.path });
      }

      if (statusCode >= 400 && statusCode < 500) {
        metrics.request.client_error.inc({ 'path': request.route.path });
      }

      if (statusCode >= 500) {
        metrics.request.server_error.inc({ 'path': request.route.path });
      }
    });
  },

  prometheusClient: client.register,
};

module.exports = Metrics;
