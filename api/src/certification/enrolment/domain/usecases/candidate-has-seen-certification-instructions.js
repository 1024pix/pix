/**
 * @typedef {import ('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import ('../models/Candidate.js').Candidate} Candidate
 */
import { CertificationCandidateNotFoundError } from '../errors.js';

/**
 * @param {Object} params
 * @param {number} params.certificationCandidateId
 * @param {CandidateRepository} params.candidateRepository
 * @returns {Candidate}
 */
const candidateHasSeenCertificationInstructions = async function ({ certificationCandidateId, candidateRepository }) {
  const candidate = await candidateRepository.get({ certificationCandidateId });

  if (!candidate) {
    throw new CertificationCandidateNotFoundError();
  }

  candidate.validateCertificationInstructions();
  await candidateRepository.update(candidate);
  return candidate;
};

export { candidateHasSeenCertificationInstructions };
