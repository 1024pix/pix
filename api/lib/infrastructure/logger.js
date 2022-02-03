const pino = require('pino');
const settings = require('../config');

const nullDestination = {
  write() {},
};

let transport;

if (settings.logging.logForHumans) {
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

const logger = pino(
  {
    level: settings.logging.logLevel,
    redact: ['req.headers.authorization'],
    transport,
  },
  settings.logging.enabled ? pino.destination() : nullDestination
);

logger.debug('DEBUG logs enabled');
logger.trace('TRACE logs enabled');

module.exports = logger;
