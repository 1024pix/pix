const pino = require('pino');
const { logging: logSettings } = require('../config');

let transport;

if (logSettings.logForHumans) {
  const omitDay = 'h:MM:ss';

  transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: omitDay,
      ignore: 'pid,hostname',
    },
  };
}

const logger = pino({
  level: logSettings.logLevel,
  redact: ['req.headers.authorization'],
  transport,
  enabled: logSettings.enabled,
});

logger.debug('DEBUG logs enabled');
logger.trace('TRACE logs enabled');

module.exports = logger;
