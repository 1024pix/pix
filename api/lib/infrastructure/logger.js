const pino = require('pino');
const settings = require('../config');

const isProduction = 'production' === process.env.NODE_ENV;

const nullDestination = { write() {} };

const logger = pino({
  level: settings.logging.logLevel,
  redact: ['req.headers.authorization'],
  prettyPrint: !isProduction,
},
(settings.logging.enabled) ? pino.destination() : nullDestination);

logger.debug('DEBUG logs enabled');
logger.trace('TRACE logs enabled');

module.exports = logger;
