/**
 * @typedef {import ('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import ('../models/Candidate.js').Candidate} Candidate
 */

/**
 * @param {Object} params
 * @param {Candidate} params.candidate
 * @param {number} params.userId
 * @param {CandidateRepository} params.candidateRepository
 *
 * @returns {Promise<Candidate>}
 */
export async function reconcileCandidate({ userId, candidate, candidateRepository }) {
  candidate.reconcile(userId);
  await candidateRepository.update(candidate);
  return candidate;
}
