const bunyan = require('bunyan');
const settings = require('../config');

const logger = bunyan.createLogger({ name: 'pix-api', streams: [] });

if (settings.logging.enabled) {

  logger.addStream({
    name: 'standard-output',
    stream: process.stdout,
    level: settings.logging.logLevel,
  });

  logger.debug('DEBUG logs enabled');
  logger.trace('TRACE logs enabled');
}

module.exports = logger;
