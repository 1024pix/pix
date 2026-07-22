/**
 * @typedef {import ('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import ('../models/Candidate.js').Candidate} Candidate
 */

/**
 * @param {object} params
 * @param {Candidate} params.candidate
 * @param {number} params.userId
 * @param {CandidateRepository} params.candidateRepository
 * @param {EventAdapter} params.eventAdapter
 *
 * @returns {Promise<Candidate>}
 */
export const reconcileCandidate = async ({ userId, candidate, candidateRepository, eventAdapter }) => {
  candidate.reconcile(userId);
  await candidateRepository.update(candidate);
  await eventAdapter.onCandidateReconciled({ candidate });
  return candidate;
};
