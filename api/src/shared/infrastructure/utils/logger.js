import isEmpty from 'lodash/isEmpty.js';
import omit from 'lodash/omit.js';
import micromatch from 'micromatch';
import pino from 'pino';
import pretty from 'pino-pretty';

import { config } from '../../config.js';

const { logging } = config;

let prettyPrint;
if (logging.logForHumans) {
  const omitDay = 'HH:MM:ss';
  prettyPrint = pretty({
    sync: true,
    colorize: true,
    translateTime: omitDay,
    ignore: 'pid,hostname',
    messageFormat: logging.logForHumansCompactFormat ? messageFormatCompact : undefined,
    hideObject: logging.logForHumansCompactFormat,
  });
}

export const logger = pino(
  {
    level: logging.logLevel,
    redact: ['req.headers.authorization'],
    enabled: logging.enabled,
  },
  prettyPrint,
);

/**
 * Creates a child logger for a section.
 * Debug may be enabled for a section using LOG_DEBUG.
 * @param {string} section
 * @param {pino.Bindings} bindings
 * @param {pino.ChildLoggerOptions} options
 */
export function child(section, bindings, options) {
  /** @type{Partial<pino.ChildLoggerOptions>} */
  const optionsOverride = {};
  if (micromatch.isMatch(section, logging.debugSections)) {
    optionsOverride.level = 'debug';
  }
  return logger.child(bindings, { ...options, ...optionsOverride });
}

export const SCOPES = {
  LEARNING_CONTENT: 'learningcontent',
  IAM: 'iam',
};

function messageFormatCompact(log, messageKey, _logLevel, { colors }) {
  const message = log[messageKey];
  const { err, req, res, responseTime } = log;

  // compact log for errors
  if (err) {
    const stack = colors.red(err.stack);
    return `${message}\n${stack}`;
  }

  // compact log for HTTP requests
  if (req && res) {
    const method = req.method?.toUpperCase();

    const queries = req.metrics?.knexQueryCount ? `sql:${req.metrics.knexQueryCount}` : '';
    const queriesTime = req.metrics?.knexTotalTimeSpent ? `sql-time:${req.metrics.knexTotalTimeSpent}` : '';

    const statusCode = res.statusCode >= 400 ? colors.red(res.statusCode) : colors.greenBright(res.statusCode);
    const request = colors.magentaBright([method, req.url].filter(Boolean).join(' '));
    const details = colors.yellow([queries, queriesTime].filter(Boolean).join(' '));
    const time = colors.gray(`(${responseTime}ms)`);

    return [statusCode, request, details, time].filter(Boolean).join(' - ');
  }

  // compact log by default
  const compactLog = omit(log, [
    messageKey,
    'id',
    'level',
    'time',
    'pid',
    'hostname',
    'uri',
    'address',
    'event',
    'started',
    'created',
  ]);
  const details = !isEmpty(compactLog) ? colors.gray(JSON.stringify(compactLog)) : '';
  return `${message} ${details}`;
}
