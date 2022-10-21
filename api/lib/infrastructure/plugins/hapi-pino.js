const config = require('../../config');
const monitoringTools = require('../monitoring-tools');

function logObjectSerializer(req) {
  const enhancedReq = {
    ...req,
    version: config.version,
  };

  if (!config.hapi.enableRequestMonitoring) return enhancedReq;
  const context = monitoringTools.getContext();

  return {
    ...enhancedReq,
    user_id: monitoringTools.extractUserIdFromRequest(req),
    metrics: context?.metrics,
    route: context?.request?.route?.path,
  };
}

const availableEvents = ['onPostStart', 'onPostStop', 'response', 'request-error'];
const logEvents = availableEvents.filter((event) => event === 'response');

const configuration = {
  plugin: require('hapi-pino'),
  options: {
    serializers: {
      req: logObjectSerializer,
    },
    instance: require('../logger'),
    // Remove duplicated req property: https://github.com/pinojs/hapi-pino#optionsgetchildbindings-request---key-any-
    getChildBindings: () => ({}),
    logQueryParams: true,
    logEvents,
  },
};

module.exports = configuration;
