const Pack = require('../package');
const settings = require('./config');
const Blipp = require('blipp');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const { get } = require('lodash');
const monitoringTools = require('./infrastructure/monitoring-tools');

function logObjectSerializer(obj) {
  if (settings.hapi.enableRequestMonitoring) {
    const context = monitoringTools.getContext();
    return {
      ...obj,
      user_id: get(context, 'request') ? monitoringTools.extractUserIdFromRequest(context.request) : '-',
      metrics: get(context, 'metrics'),
    };
  } else {
    return { ...obj };
  }
}

const plugins = [
  Inert,
  Vision,
  Blipp,
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
      instance: require('./infrastructure/logger'),
      logQueryParams: true,
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
