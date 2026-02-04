/**
 * @typedef {import ('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import ('../models/Candidate.js').Candidate} Candidate
 */

import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';

/**
 * @param {object} params
 * @param {Candidate} params.candidate
 * @param {number} params.userId
 * @param {CandidateRepository} params.candidateRepository
 *
 * @returns {Promise<Candidate>}
 */
export const reconcileCandidate = withTransaction(async ({ userId, candidate, candidateRepository }) => {
  candidate.reconcile(userId);
  await candidateRepository.update(candidate);
  return candidate;
});
