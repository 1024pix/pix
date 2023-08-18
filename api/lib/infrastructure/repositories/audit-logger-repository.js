import { httpAgent } from '../http/http-agent.js';
import { config } from '../../config.js';
import { AuditLoggerApiError } from '../../domain/errors.js';

const { auditLogger } = config;
const basicAuthorizationToken = btoa(`pix-api:${auditLogger.clientSecret}`);

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

const auditLoggerRepository = { logEvent };

export { auditLoggerRepository };
