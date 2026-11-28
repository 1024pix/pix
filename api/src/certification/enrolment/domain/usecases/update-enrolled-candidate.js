/**
 * @typedef {import('./index.js').CandidateRepository} CandidateRepository
 */

import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CandidateAlreadyLinkedToUserError } from '../../../../shared/domain/errors.js';
import { CertificationCandidateNotFoundError } from '../../../shared/domain/errors.js';

/**
 * @param {object} params
 * @param {Candidate} params.candidate
 * @param {CandidateRepository} params.candidateRepository
 */
export const updateEnrolledCandidate = withTransaction(async function ({ candidate, candidateRepository }) {
  const foundCandidate = await candidateRepository.get({ certificationCandidateId: candidate.id });

  if (!foundCandidate) {
    throw new CertificationCandidateNotFoundError();
  }

  if (foundCandidate.isReconciled() || candidate.isReconciled()) {
    throw new CandidateAlreadyLinkedToUserError();
  }
  
  return candidateRepository.update(candidate);
});
