import * as sessionApi from '../../../session-management/application/api/session-api.js';

/**
 * @param {object} params
 * @param {number} params.certificationId
 * @param {number} params.sessionId
 * @param {number} params.candidateId
 * @param {string} params.timezone
 * @returns {Promise<void>}
 */
export async function onCertificationStarted({
  certificationId,
  sessionId,
  candidateId,
  timezone,
  dependencies = { sessionApi },
}) {
  await dependencies.sessionApi.onCertificationStarted({ certificationId, sessionId, candidateId, timezone });
}
