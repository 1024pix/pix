import * as supervisedCandidateRepository from '../../infrastructure/repositories/supervised-candidate-repository.js';
import * as supervisedSessionRepository from '../../infrastructure/repositories/supervised-session-repository.js';

/**
 * @function
 * @name onCertificationStartedOrResumed
 * @param {object} params
 * @param {number} params.certificationId
 * @param {number} params.sessionId
 * @param {string} params.timezone - timezone of the candidate starting the certification test
 * @returns {Promise<void>}
 */
export async function onCertificationStartedOrResumed({
  certificationId,
  candidateId,
  sessionId,
  timezone,
  dependencies = { supervisedSessionRepository, supervisedCandidateRepository },
}) {
  const supervisedSession = await dependencies.supervisedSessionRepository.findById({
    id: sessionId,
  });
  if (!supervisedSession) {
    return;
  }

  const hasDateChanged = supervisedSession.setStartDate({ certificationId, timezone });
  if (hasDateChanged) {
    await dependencies.supervisedSessionRepository.update(supervisedSession);
  }

  await dependencies.supervisedCandidateRepository.unauthorizeToStart(candidateId);
}
