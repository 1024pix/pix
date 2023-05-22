import pino from 'pino';
import pretty from 'pino-pretty';
import { config } from '../config.js';

const { logging } = config;

let prettyPrint;
if (logging.logForHumans) {
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
    level: logging.logLevel,
    redact: ['req.headers.authorization'],
    enabled: logging.enabled,
  },
  prettyPrint
);

export { logger };
