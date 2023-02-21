import config from '../../config';
import monitoringTools from '../monitoring-tools';
import hapiPino from 'hapi-pino';
import logger from '../logger';

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

export default {
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
