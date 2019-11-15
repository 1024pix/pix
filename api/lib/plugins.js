const Pack = require('../package');
const Metrics = require('./infrastructure/plugins/metrics');
const settings = require('./config');

const isProduction = ['production', 'staging'].includes(process.env.NODE_ENV);

const consoleReporters =
  isProduction ?
    [
      {
        module: 'good-squeeze',
        name: 'SafeJson',
        args: []
      },
    ]
    :
    [
      {
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{
          response: '*',
          log: '*'
        }]
      },
      {
        module: 'good-console',
        args: [{
          color: settings.logging.colorEnabled
        }]
      }
    ]
    ;

if (settings.logging.enabled) {
  consoleReporters.push('stdout');
}

const plugins = [
  Metrics,
  require('@hapi/inert'),
  require('vision'),
  require('blipp'),
  {
    plugin: require('hapi-swagger'),
    options: {
      basePath: '/api',
      grouping: 'tags',
      info: {
        'title': 'PIX API Documentation',
        'version': Pack.version
      },
      documentationPath: '/api/documentation'
    }
  },
  {
    plugin: require('good'),
    options: {
      reporters: {
        console: consoleReporters,
      }
    }
  },
  ...(settings.sentry.enabled ? [
    {
      plugin: require('hapi-sentry'),
      options: {
        client: {
          dsn: settings.sentry.dsn,
          environment: settings.sentry.environment,
          release: Pack.version,
          maxBreadcrumbs: settings.sentry.maxBreadcrumbs,
          debug: settings.sentry.debug,
        },
        scope: {
          tags: [
            { name: 'source', value: 'api' }
          ]
        }
      }
    }
  ] : [])
];

module.exports = plugins;
