import { config } from '../../config.js';
import { AuditLoggerApiError } from '../../domain/errors.js';
import { httpAgent } from '../http/http-agent.js';

const { auditLogger } = config;
const basicAuthorizationToken = btoa(`pix-api:${auditLogger.clientSecret}`);

/**
 * Log an event
 *
 * @param {Object} event Event to log
 * @param {string} event.targetUserId User id which is concerned by the event
 * @param {string} event.userId User id which is logging the event
 * @param {Date} event.occurredAt Date of the event
 * @param {AuditLogAction} event.action Action type of the event
 * @param {AuditLogRole} event.role Role of the event
 * @param {AuditLogClient} event.client Client system of the event
 */
const logEvent = async function (event) {
  const url = `${auditLogger.baseUrl}/api/audit-logs`;
  const headers = {
    Authorization: `Basic ${basicAuthorizationToken}`,
  };

  const { code, isSuccessful } = await httpAgent.post({ url, payload: event, headers });

  if (!isSuccessful) {
    throw new AuditLoggerApiError(`Pix Audit Logger Api answered with status ${code}`);
  }
};

/**
 * Log multiple events
 *
 * @param {Object[]} events Event to log
 * @param {string} event[].targetUserId User id which is concerned by the event
 * @param {string} event[].userId User id which is logging the event
 * @param {Date} events[].occurredAt Date of the event
 * @param {AuditLogAction} events[].action Action type of the event
 * @param {AuditLogRole} events[].role Role of the event
 * @param {AuditLogClient} events[].client Client system of the event
 */
const logEvents = async function (events) {
  await logEvent(events);
};

const auditLoggerRepository = { logEvent, logEvents };

export { auditLoggerRepository };
