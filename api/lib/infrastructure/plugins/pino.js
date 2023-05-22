import { config } from '../../config.js';
import { monitoringTools } from '../monitoring-tools.js';
import hapiPino from 'hapi-pino';
import { logger } from '../logger.js';
import crypto from 'crypto';

function logObjectSerializer(req) {
  const enhancedReq = {
    ...req,
    version: config.version,
  };

  if (!config.hapi.enableRequestMonitoring) return enhancedReq;
  const context = monitoringTools.getContext();
  if (context?.request?.route?.path === '/api/token') {
    const hash = crypto.createHash('sha256');
    const username = context?.request?.payload?.username;
    enhancedReq.usernameHash = username ? hash.update(username).digest('hex') : '-';
  }

  return {
    ...enhancedReq,
    user_id: monitoringTools.extractUserIdFromRequest(req),
    metrics: context?.metrics,
    route: context?.request?.route?.path,
  };
}

const plugin = hapiPino;
const options = {
  serializers: {
    req: logObjectSerializer,
  },
  instance: logger,
  // Remove duplicated req property: https://github.com/pinojs/hapi-pino#optionsgetchildbindings-request---key-any-
  getChildBindings: () => ({}),
  logQueryParams: true,
};

export { plugin, options };
