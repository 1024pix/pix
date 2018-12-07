const Pack = require('../package');
const Metrics = require('./infrastructure/plugins/metrics');
const settings = require('./settings');

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
  require('inert'),
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
  ...(isProduction ? [
    {
      plugin: require('hapi-raven'),
      options: {
        dsn: process.env.SENTRY_DSN,
        tags: {
          source: 'api'
        }
      }
    }
  ] : [])
];

module.exports = plugins;
