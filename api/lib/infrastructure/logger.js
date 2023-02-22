const pino = require('pino');
const pretty = require('pino-pretty');
const { logging: logSettings } = require('../config');

let prettyPrint;
if (logSettings.logForHumans) {
  // eslint-disable-next-line node/no-unpublished-require
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

module.exports = logger;
