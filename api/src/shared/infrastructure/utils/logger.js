import isEmpty from 'lodash/isEmpty.js';
import omit from 'lodash/omit.js';
import micromatch from 'micromatch';
import pino from 'pino';
import pretty from 'pino-pretty';

import { config } from '../../config.js';
import { getCorrelationContext } from '../execution-context-manager.js';

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

export const loggerPino = pino(
  {
    level: logging.logLevel,
    redact: ['req.headers.authorization'],
    enabled: logging.enabled,
  },
  prettyPrint,
);

function buildLogWrapper(context, mergingObject, message, extraBindings = {}, extraOptions = undefined) {
  const loggerChild = loggerPino.child({ ...getCorrelationContext(), ...extraBindings }, extraOptions);
  loggerChild[context](mergingObject, message);
}

export const logger = {
  trace: (mergingObject, message) => {
    buildLogWrapper('trace', mergingObject, message);
  },
  debug: (mergingObject, message) => {
    buildLogWrapper('debug', mergingObject, message);
  },
  info: (mergingObject, message) => {
    buildLogWrapper('info', mergingObject, message);
  },
  warn: (mergingObject, message) => {
    buildLogWrapper('warn', mergingObject, message);
  },
  error: (mergingObject, message) => {
    buildLogWrapper('error', mergingObject, message);
  },
  fatal: (mergingObject, message) => {
    buildLogWrapper('fatal', mergingObject, message);
  },
  silent: (mergingObject, message) => {
    buildLogWrapper('silent', mergingObject, message);
  },
};

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
  const extraOptions = { ...options, ...optionsOverride };
  return {
    trace: (mergingObject, message) => {
      buildLogWrapper('trace', mergingObject, message, bindings, extraOptions);
    },
    debug: (mergingObject, message) => {
      buildLogWrapper('debug', mergingObject, message, bindings, extraOptions);
    },
    info: (mergingObject, message) => {
      buildLogWrapper('info', mergingObject, message, bindings, extraOptions);
    },
    warn: (mergingObject, message) => {
      buildLogWrapper('warn', mergingObject, message, bindings, extraOptions);
    },
    error: (mergingObject, message) => {
      buildLogWrapper('error', mergingObject, message, bindings, extraOptions);
    },
    fatal: (mergingObject, message) => {
      buildLogWrapper('fatal', mergingObject, message, bindings, extraOptions);
    },
    silent: (mergingObject, message) => {
      buildLogWrapper('silent', mergingObject, message, bindings, extraOptions);
    },
  };
}

export const SCOPES = {
  LEARNING_CONTENT: 'learningcontent',
  IAM: 'iam',
  LLM: 'llm',
  DEVCOMP: 'devcomp',
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
    const correlationInfo = colors.gray(
      JSON.stringify({
        user_id: req.user_id,
        request_id: req.request_id,
        scriptName: req.scriptName,
        jobId: req.jobId,
      }),
    );

    return [statusCode, request, details, time, correlationInfo].filter(Boolean).join(' - ');
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
