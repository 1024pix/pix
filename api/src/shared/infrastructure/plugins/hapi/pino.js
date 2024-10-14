import { stdSerializers } from 'pino';

import { monitoringTools } from '../../../../../src/shared/infrastructure/monitoring-tools.js';
import { generateHash } from '../../../../identity-access-management/infrastructure/utils/crypto.js';
import { config } from '../../../config.js';
import { logger } from '../../utils/logger.js';

const serializersSym = Symbol.for('pino.serializers');

function requestSerializer(req) {
  const enhancedReq = {
    ...req,
    version: config.version,
    clientVersion: req.headers['x-app-version'] || '-',
    clientVersionMismatched: config.version !== req.headers['x-app-version'],
  };

  if (!config.hapi.enableRequestMonitoring) return enhancedReq;

  // monitor api token route
  const context = monitoringTools.getContext();
  if (context?.request?.route?.path === '/api/token') {
    const { username, refresh_token, grant_type, scope } = context.request.payload || {};
    enhancedReq.grantType = grant_type || '-';
    enhancedReq.scope = scope || '-';
    enhancedReq.usernameHash = generateHash(username) || '-';
    enhancedReq.refreshTokenHash = generateHash(refresh_token) || '-';
  }

  return {
    ...enhancedReq,
    user_id: monitoringTools.extractUserIdFromRequest(req),
    metrics: context?.metrics,
    route: context?.request?.route?.path,
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
        logger.error(
          {
            tags: event.tags,
            err: event.error,
          },
          'request error',
        );
      }
    });

    server.events.on('response', (request) => {
      const info = request.info;
      logger.info(
        {
          queryParams: request.query,
          req: request,
          res: request.raw.res,
          responseTime: (info.completed !== undefined ? info.completed : info.responded) - info.received,
        },
        'request completed',
      );
    });
  },
};

const options = {
  instance: logger,
};

export { options, plugin };
