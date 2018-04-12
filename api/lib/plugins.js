const HapiSwagger = require('hapi-swagger');
const Pack = require('../package');
const Metrics = require('./infrastructure/plugins/metrics');
const settings = require('./settings');

const consoleReporters = [
  {
    module: 'good-squeeze',
    name: 'Squeeze',
    args: [{
      response: '*',
      log: '*'
    }]
  }, {
    module: 'good-console',
    args: [{
      color: settings.logging.colorEnabled
    }]
  }
];

if (settings.logging.enabled) {
  consoleReporters.push('stdout');
}

const plugins = [
  Metrics,
  require('inert'),
  require('vision'),
  require('blipp'),
  {
    register: HapiSwagger,
    options: {
      info: {
        'title': 'PIX API Documentation',
        'version': Pack.version
      },
      documentationPath: '/api/documentation'
    }
  },
  {
    register: require('good'),
    options: {
      reporters: {
        console: consoleReporters,
      }
    }
  }
];

module.exports = plugins;
