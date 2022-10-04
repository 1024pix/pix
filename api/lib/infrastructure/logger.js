const pino = require('pino');
const { logging: logSettings } = require('../config');

let prettyPrint;
if (logSettings.logForHumans) {
  // eslint-disable-next-line node/no-unpublished-require
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

if (logSettings.enabled) {
  // we use console.log because the logger itself will not log any message
  // eslint-disable-next-line no-console
  console.log(`Logging level: ${logSettings.logLevel}`);
} else {
  // we use console.log because the logger itself will not log any message is loggingLevel is below INFO
  // eslint-disable-next-line no-console
  console.log(`Logging is disabled`);
}

module.exports = logger;
