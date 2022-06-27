const Pack = require('../package');
const settings = require('./config');
const logger = require('./infrastructure/logger');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const monitoringTools = require('./infrastructure/monitoring-tools');
const createRedisRateLimit = require('./infrastructure/utils/redis-rate-limit');
const { TooManyRequestsError } = require('./application/http-errors');

const config = settings;

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
      defaultRate: () => {
        return {
          limit: config.rateLimit.limit,
          window: config.rateLimit.window,
        };
      },
      key: (request) => {
        return request.auth.credentials.userId;
      },
      redisClient: config.rateLimit.redisUrl ? createRedisRateLimit(config.rateLimit.redisUrl) : null,
      overLimitError: (rate, request, h) => {
        logger.error({ request_id: request.headers['x-request-id'], overLimit: rate.overLimit }, 'Rate limit exceeded');
        if (config.rateLimit.logOnly) {
          return h.continue;
        } else {
          return new TooManyRequestsError(`Rate Limit Exceeded - try again in ${rate.window} seconds`);
        }
      },
      onRedisError: (err) => {
        logger.error(err);
        throw err;
      },
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
