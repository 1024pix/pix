const pino = require('pino');
const { logging: logSettings } = require('../config');

let prettyPrint;
if (logSettings.logForHumans) {
  const pretty = require('pino-pretty');
  const omitDay = 'HH:MM:ss';
  prettyPrint = pretty({
    sync: true,
    colorize: true,
    translateTime: omitDay,
    ignore: 'pid,hostname',
  });
}

const logger = pino(
  {
    level: logSettings.logLevel,
    redact: ['req.headers.authorization'],
    enabled: logSettings.enabled,
  },
  prettyPrint
);

logger.error('ERROR logs enabled');
logger.warn('WARN logs enabled');
logger.info('INFO logs enabled');
logger.debug('DEBUG logs enabled');
logger.trace('TRACE logs enabled');

module.exports = logger;
