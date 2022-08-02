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

module.exports = {
  plugin: require('hapi-pino'),
  options: {
    serializers: {
      req: logObjectSerializer,
    },
    instance: require('../logger'),
    logQueryParams: true,
  },
};
