const Pack = require('../package');
const settings = require('./config');
const logger = require('./infrastructure/logger');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const monitoringTools = require('./infrastructure/monitoring-tools');
const RedisClient = require('./infrastructure/utils/RedisClient');
const { TooManyRequestsError } = require('./application/http-errors');

const { rateLimit } = settings;

function logObjectSerializer(req) {
  const enhancedReq = {
    ...req,
    version: settings.version,
  };

  if (!settings.hapi.enableRequestMonitoring) return enhancedReq;
  const context = monitoringTools.getContext();

  return {
    ...enhancedReq,
    user_id: monitoringTools.extractUserIdFromRequest(req),
    metrics: context?.metrics,
    route: context?.request?.route?.path,
  };
}

const redisClient = rateLimit.redisUrl ? new RedisClient(rateLimit.redisUrl, 'api-rate-limiter') : null;

const defaultRate = {
  limit: rateLimit.limit,
  window: rateLimit.window,
};

const plugins = [
  Inert,
  Vision,
  {
    plugin: require('hapi-i18n'),
    options: {
      locales: ['en', 'fr'],
      directory: __dirname + '/../translations',
      defaultLocale: 'fr',
      queryParameter: 'lang',
      languageHeaderField: 'Accept-Language',
      objectNotation: true,
      updateFiles: false,
    },
  },
  {
    plugin: require('hapi-pino'),
    options: {
      serializers: {
        req: logObjectSerializer,
      },
      // Remove duplicated req property: https://github.com/pinojs/hapi-pino#optionsgetchildbindings-request---key-any-
      getChildBindings: () => ({}),
      instance: require('./infrastructure/logger'),
      logQueryParams: true,
    },
  },
  {
    plugin: require('hapi-rate-limiter'),
    options: {
      defaultRate: () => defaultRate,
      key: (request) => {
        return request.auth.credentials.userId;
      },
      redisClient,
      overLimitError: (rate, request, h) => {
        logger.error({ request_id: request.info.id, overLimit: rate.overLimit }, 'Rate limit exceeded');
        if (rateLimit.logOnly) {
          return h.continue;
        } else {
          return new TooManyRequestsError(`Rate Limit Exceeded - try again in ${rate.window} seconds`);
        }
      },
      onRedisError: (err) => logger.error(err),
    },
  },
  ...(settings.sentry.enabled
    ? [
        {
          plugin: require('hapi-sentry'),
          options: {
            client: {
              dsn: settings.sentry.dsn,
              environment: settings.sentry.environment,
              release: `v${Pack.version}`,
              maxBreadcrumbs: settings.sentry.maxBreadcrumbs,
              debug: settings.sentry.debug,
              maxValueLength: settings.sentry.maxValueLength,
            },
            scope: {
              tags: [{ name: 'source', value: 'api' }],
            },
          },
        },
      ]
    : []),
];

module.exports = plugins;
