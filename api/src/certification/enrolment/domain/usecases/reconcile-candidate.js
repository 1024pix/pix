/**
 * @typedef {import ('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import ('../models/Candidate.js').Candidate} Candidate
 * @typedef {import ('../models/SessionEnrolment.js').SessionEnrolment} SessionEnrolment
 */

import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';

/**
 * @param {Object} params
 * @param {Candidate} params.candidate
 * @param {SessionEnrolment} params.session
 * @param {number} params.userId
 * @param {CandidateRepository} params.candidateRepository
 *
 * @returns {Promise<Candidate>}
 */
export async function reconcileCandidate({ userId, candidate, candidateRepository }) {
  candidate.reconcile(userId);

  await _saveReconcilement({ candidate, candidateRepository });
  return candidate;
}

const _saveReconcilement = withTransaction(
  /**
   * @param {Object} params
   * @param {number} params.userId
   * @param {Candidate} params.candidate
   * @param {CandidateRepository} params.candidateRepository
   */
  async ({ candidate, candidateRepository }) => {
    await candidateRepository.update(candidate);

    return candidate;
  },
);
