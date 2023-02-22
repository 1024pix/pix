const config = require('../../config');
const monitoringTools = require('../monitoring-tools');
const hapiPino = require('hapi-pino');
const logger = require('../logger');

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

module.exports = {
  plugin: hapiPino,
  options: {
    serializers: {
      req: logObjectSerializer,
    },
    instance: logger,
    // Remove duplicated req property: https://github.com/pinojs/hapi-pino#optionsgetchildbindings-request---key-any-
    getChildBindings: () => ({}),
    logQueryParams: true,
  },
};
