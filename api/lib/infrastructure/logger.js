import pino from 'pino';
import { logging as logSettings } from '../config';

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

export default logger;
