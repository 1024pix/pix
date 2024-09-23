/**
 * @typedef {import ('./index.js').EnrolledCandidateRepository} EnrolledCandidateRepository
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
 * @returns {Promise<EnrolledCandidate>}
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

  if (candidate.isLinkedToAUser()) {
    return candidate;
  }

  return usecases.linkUserToCandidate({
    userId,
    candidate,
  });
};
