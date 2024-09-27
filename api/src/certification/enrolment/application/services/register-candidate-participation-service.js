/**
 * @typedef {import ('../../domain/models/Candidate.js').Candidate} Candidate
 */

import { usecases } from '../../domain/usecases/index.js';

/**
 * Candidate entry to a certification is a multi step process
 * @param {Object} params
 * @param {number} params.userId
 * @param {number} params.sessionId
 * @param {string} params.firstName
 * @param {string} params.lastName
 * @param {Date} params.birthdate
 * @param {Function} params.normalizeStringFnc
 * @returns {Promise<Candidate>}
 */
export const registerCandidateParticipation = async ({
  userId,
  sessionId,
  firstName,
  lastName,
  birthdate,
  normalizeStringFnc,
}) => {
  const candidate = await usecases.verifyCandidateIdentity({
    userId,
    sessionId,
    firstName,
    lastName,
    birthdate,
    normalizeStringFnc,
  });

  if (candidate.isReconciled()) {
    return candidate;
  }

  await usecases.verifyCandidateSubscriptions({
    candidate,
    userId,
    sessionId,
  });

  return usecases.reconcileCandidate({
    userId,
    candidate,
  });
};
