import { stdSerializers } from 'pino';

import { config } from '../../config.js';
import { getCorrelationInfo, getInContext, setInContext } from '../execution-context-manager.js';
import { generateHash } from '../utils/crypto.js';
import { loggerPino } from '../utils/logger.js';
import { getForwardedOrigin } from '../utils/network.js';
import { routeDomainToOwnerTeam } from '../utils/route-domain-to-owner-team.js';

const serializersSym = Symbol.for('pino.serializers');

function requestSerializer(req) {
  const request = getInContext('request', req);
  const serializedRequest = stdSerializers.req(request);
  serializedRequest.version = config.version;
  serializedRequest.clientVersion = request.headers['x-app-version'] || '-';
  serializedRequest.clientVersionMismatched = config.version !== request.headers['x-app-version'];

  // monitor api token route
  if (request?.route?.path === '/api/token') {
    const { username, refresh_token, grant_type } = request.payload || {};
    let origin;
    try {
      origin = getForwardedOrigin(request.headers);
    } catch {
      origin = '-';
    }
    serializedRequest.audience = origin;
    serializedRequest.grantType = grant_type || '-';
    serializedRequest.usernameHash = generateHash(username) || '-';
    serializedRequest.refreshTokenHash = generateHash(refresh_token) || '-';
    setInContext('user_id', request?.response?.source?.user_id);
  }

  const metrics = getInContext('metrics', null);
  return {
    ...serializedRequest,
    ...getCorrelationInfo(),
    metrics,
    route: request?.route?.path,
    routeDomain: request?.route?.realm?.plugin,
    teamsToContact: routeDomainToOwnerTeam(config.routeDomainToOwnerTeamMapping, request?.route?.realm?.plugin).join(
      ',',
    ),
  };
}

function errorSerializer(err) {
  const serializedError = stdSerializers.err(err);
  return {
    ...serializedError,
    ...getCorrelationInfo(),
  };
}

const plugin = {
  name: 'hapi-pino',
  register: async function (server, options) {
    const serializers = {
      req: stdSerializers.wrapRequestSerializer(requestSerializer),
      res: stdSerializers.wrapResponseSerializer(stdSerializers.res),
      err: stdSerializers.wrapErrorSerializer(errorSerializer),
    };
    const logger = options.instance;
    logger[serializersSym] = Object.assign({}, logger[serializersSym], serializers);

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
