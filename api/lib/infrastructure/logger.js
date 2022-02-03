const pino = require('pino');
const settings = require('../config');

const nullDestination = {
  write() {},
};

let pinoPrettyOptions;

if (settings.logging.logForHumans) {
  const omitDay = 'h:MM:ss';

  pinoPrettyOptions = {
    colorize: true,
    translateTime: omitDay,
    ignore: 'pid,hostname',
  };
} else {
  pinoPrettyOptions = false;
}

const logger = pino(
  {
    level: settings.logging.logLevel,
    redact: ['req.headers.authorization'],
    transport: {
      target: 'pino-pretty',
      options: pinoPrettyOptions,
    },
  },
  settings.logging.enabled ? pino.destination() : nullDestination
);

logger.debug('DEBUG logs enabled');
logger.trace('TRACE logs enabled');

module.exports = logger;
