import pino from 'pino';
import pretty from 'pino-pretty';

import { config } from '../../config.js';
import { getCorrelationContext } from '../monitoring-tools.js';

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

/**
 * Pino Logger - How to use :
 * logger.<anyLoggingMethod>([mergingObject], [message])
 * with
 *  - mergingObject <Object>: an object optionally supplied. Each enumerable key and value of the mergingObject is copied into the JSON log line.
 *  - message <String>: a string which will be merged into the JSON log line under the "msg" key.
 * NOTE: The [message] parameter takes precedence over the [mergingObject].
 * That is, if a [mergingObject] contains a "msg" property, and a [message] parameter is supplied in addition,
 * the "msg" property in the output log will be the value of the [message] parameter not the value of the "msg" property on the [mergingObject]

 * Interoperability with Datadog
 * In order to be displayed properly in Datadog, the [mergingObject] can contain the following keys
 * @example
 * {
 *   context: 'My Context',
 *   data: { more: 'data', if: 'needed' },
 *   event: 'Event which trigger this error',
 *   team: 'My Team',
 *   msg: 'My message related to the log',
 * };
 */
const logger = pino(
  {
    level: logging.logLevel,
    redact: ['req.headers.authorization'],
    enabled: logging.enabled,
    mixin() {
      return getCorrelationContext();
    },
    mixinMergeStrategy(mergeObject, mixinObject) {
      return Object.assign(Object.create(mergeObject), mixinObject);
    },
  },
  prettyPrint,
);

export { logger };
