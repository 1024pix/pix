import { stdSerializers } from 'pino';

import { generateHash } from '../../../identity-access-management/infrastructure/utils/crypto.js';
import { getForwardedOrigin } from '../../../identity-access-management/infrastructure/utils/network.js';
import { config } from '../../config.js';
import { getContext, getCorrelationContext } from '../execution-context-manager.js';
import { loggerPino } from '../utils/logger.js';

const serializersSym = Symbol.for('pino.serializers');

function requestSerializer(req) {
  const enhancedReq = {
    ...req,
    version: config.version,
    clientVersion: req.headers['x-app-version'] || '-',
    clientVersionMismatched: config.version !== req.headers['x-app-version'],
  };

  // monitor api token route
  const context = getContext();
  if (context?.request?.route?.path === '/api/token') {
    const { username, refresh_token, grant_type } = context.request.payload || {};
    let origin;
    try {
      origin = getForwardedOrigin(context.request.headers);
    } catch {
      origin = '-';
    }
    enhancedReq.audience = origin;
    enhancedReq.grantType = grant_type || '-';
    enhancedReq.usernameHash = generateHash(username) || '-';
    enhancedReq.refreshTokenHash = generateHash(refresh_token) || '-';
  }

  return {
    ...enhancedReq,
    ...getCorrelationContext(),
    metrics: context?.metrics,
    route: context?.request?.route?.path,
    routeDomain: context?.request?.route?.realm?.plugin,
  };
}

const plugin = {
  name: 'hapi-pino',
  register: async function (server, options) {
    const serializers = {
      req: stdSerializers.wrapRequestSerializer(requestSerializer),
      res: stdSerializers.wrapResponseSerializer(stdSerializers.res),
    };
    const logger = options.instance;
    logger[serializersSym] = Object.assign({}, serializers, logger[serializersSym]);

    server.ext('onPostStart', async function () {
      logger.info(server.info, 'server started');
    });

    server.ext('onPostStop', async function () {
      logger.info(server.info, 'server stopped');
    });

    server.events.on('log', function (event) {
      logger.info({ tags: event.tags, data: event.data });
    });

    server.events.on('request', function (request, event) {
      if (event.channel !== 'error') {
        return;
      }
      if (event.error) {
        logger.error({ tags: event.tags, err: event.error }, 'request error');
      }
    });

    server.events.on('response', (request) => {
      const info = request.info;

      const shouldLog = !config.metrics.isDirectMetricsEnabled;

      if (shouldLog || request.raw.res.statusCode != 200) {
        logger.info(
          {
            queryParams: request.query,
            req: request,
            res: request.raw.res,
            responseTime: (info.completed !== undefined ? info.completed : info.responded) - info.received,
          },
          'request completed',
        );
      }
    });
  },
};

const options = {
  instance: loggerPino,
};

export { options, plugin };
