/**
 * @typedef {import ('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import ('../models/Candidate.js').Candidate} Candidate
 */
import { CertificationCandidateNotFoundError } from '../../../shared/domain/errors.js';

/**
 * @param {object} params
 * @param {number} params.certificationCandidateId
 * @param {CandidateRepository} params.candidateRepository
 * @returns {Candidate}
 */
export async function candidateHasSeenCertificationInstructions({ certificationCandidateId, candidateRepository }) {
  const candidate = await candidateRepository.get({ certificationCandidateId });

  if (!candidate) {
    throw new CertificationCandidateNotFoundError();
  }
  candidate.validateCertificationInstructions();
  await candidateRepository.update(candidate);
  return candidate;
}
