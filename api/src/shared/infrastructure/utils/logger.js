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

function parseDataForLogger(data) {
  return typeof data === 'string' || data instanceof String
    ? {
        message: data,
      }
    : data;
}

function _logErrorWithCorrelationIds(logger) {
  return function (data) {
    const parsedData = parseDataForLogger(data);
    const context = getCorrelationContext();
    logger.error(
      {
        ...context,
        ...omit(parsedData, 'message'),
      },
      get(parsedData, 'message', '-'),
    );
  };
}

function _logInfoWithCorrelationIds(logger) {
  return function (data) {
    const parsedData = parseDataForLogger(data);
    const context = getCorrelationContext();
    logger.info(
      {
        ...context,
        ...omit(parsedData, 'message'),
      },
      get(parsedData, 'message', '-'),
    );
  };
}

/**
 * In order to be displayed properly in Datadog,
 * the parameter "data" should contain
 * - a required property message as string
 * - all other properties you need to pass to Datadog
 *
 * @example
 * const data = {
 *   message: 'Error message',
 *   context: 'My Context',
 *   data: { more: 'data', if: 'needed' },
 *   event: 'Event which trigger this error',
 *   team: 'My Team',
 * };
 * logErrorWithCorrelationIds(data);
 *
 * @param {object} data
 */
const logErrorWithCorrelationIds = _logErrorWithCorrelationIds(internalLogger);
const logInfoWithCorrelationIds = _logInfoWithCorrelationIds(internalLogger);

const logger = {
  error: logErrorWithCorrelationIds,
  info: logInfoWithCorrelationIds,
  warn: internalLogger.warn.bind(internalLogger),
  trace: internalLogger.trace.bind(internalLogger),
  fatal: internalLogger.fatal.bind(internalLogger),
  debug: internalLogger.debug.bind(internalLogger),
};

export { getCorrelationContext, logErrorWithCorrelationIds, logger, logInfoWithCorrelationIds };
