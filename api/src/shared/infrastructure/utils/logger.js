import lodash from 'lodash';
import pino from 'pino';
import pretty from 'pino-pretty';

import { asyncLocalStorage } from '../../../prescription/shared/infrastructure/utils/async-local-storage.js';
import { config } from '../../config.js';
import { requestResponseUtils } from './request-response-utils.js';

const { get, omit } = lodash;

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

const internalLogger = pino(
  {
    level: logging.logLevel,
    redact: ['req.headers.authorization'],
    enabled: logging.enabled,
  },
  prettyPrint,
);

function getCorrelationContext() {
  if (!config.hapi.enableRequestMonitoring) {
    return {};
  }
  const context = asyncLocalStorage.getStore();
  const request = get(context, 'request');
  return {
    user_id: extractUserIdFromRequest(request),
    request_id: get(request, 'info.id', '-'),
  };
}

function extractUserIdFromRequest(request) {
  let userId = get(request, 'auth.credentials.userId');
  if (!userId && get(request, 'headers.authorization')) userId = requestResponseUtils.extractUserIdFromRequest(request);
  return userId || '-';
}

function _parseDataForLogger(data) {
  return typeof data === 'string' || data instanceof String ? { message: data } : data;
}

function _logWithCorrelationIds(loggingFunction) {
  return function (data) {
    const parsedData = _parseDataForLogger(data);
    const context = getCorrelationContext();
    loggingFunction(
      {
        ...context,
        ...omit(parsedData, 'message'),
      },
      get(parsedData, 'message', '-'),
    );
  };
}

/**
 * @param {object|string} data
 * @see : logger#error for details
 * @deprecated use logger#error instead
 */
const logErrorWithCorrelationIds = _logWithCorrelationIds(internalLogger.error.bind(internalLogger));

/**
 * @param {object|string} data
 * @see : logger#info for details
 * @deprecated use logger#info instead
 */
const logInfoWithCorrelationIds = _logWithCorrelationIds(internalLogger.info.bind(internalLogger));

const logger = {
  /**
   * In order to be displayed properly in Datadog,
   * the parameter "data" should contain
   * - a required property message as string
   * - all other properties you need to pass to Datadog
   *
   * It is also possible to provide raw message as string.
   *
   * @example
   * const data = {
   *   message: 'Error message',
   *   context: 'My Context',
   *   data: { more: 'data', if: 'needed' },
   *   event: 'Event which trigger this error',
   *   team: 'My Team',
   * };
   * logger.error(data);
   * or
   * logger.error('Error message');
   *
   * @param {object|string} data
   */
  error: _logWithCorrelationIds(internalLogger.error.bind(internalLogger)),
  /**
   * @param {object|string} data
   * @see : logger#error for details
   */
  info: _logWithCorrelationIds(internalLogger.info.bind(internalLogger)),
  /**
   * @param {object|string} data
   * @see : logger#error for details
   */
  warn: internalLogger.warn.bind(internalLogger),
  /**
   * @param {object|string} data
   * @see : logger#error for details
   */
  trace: internalLogger.trace.bind(internalLogger),
  /**
   * @param {object|string} data
   * @see : logger#error for details
   */
  fatal: internalLogger.fatal.bind(internalLogger),
  /**
   * @param {object|string} data
   * @see : logger#error for details
   */
  debug: internalLogger.debug.bind(internalLogger),
};

export { getCorrelationContext, logErrorWithCorrelationIds, logger, logInfoWithCorrelationIds };
