import pino from 'pino';
import pretty from 'pino-pretty';
import { logging as logSettings } from '../config.js';

let prettyPrint;
if (logSettings.logForHumans) {
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

export { logger };
