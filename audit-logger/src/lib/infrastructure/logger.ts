import pino, { type Logger, type LoggerOptions } from 'pino';
import pretty from 'pino-pretty';

import { config } from '../config.js';

const { logging } = config;

let logger: Logger;
const loggerOptions: LoggerOptions = {
  level: logging.logLevel,
  redact: ['req.headers.authorization'],
  enabled: logging.enabled,
};

if (logging.logForHumans) {
  const omitDay = 'HH:MM:ss';
  const prettyPrint = pretty({
    sync: true,
    colorize: true,
    translateTime: omitDay,
    ignore: 'pid,hostname',
  });
  // @ts-expect-error library types definitions are not correct
  logger = pino(loggerOptions, prettyPrint);
} else {
  // @ts-expect-error library types definitions are not correct
  logger = pino(loggerOptions);
}

export { logger };
