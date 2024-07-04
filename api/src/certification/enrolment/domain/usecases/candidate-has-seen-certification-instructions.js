/**
 * @typedef {import ('./index.js').CandidateRepository} CandidateRepository
 */
import { CertificationCandidateNotFoundError } from '../errors.js';

/**
 * @param {Object} params
 * @param {CandidateRepository} params.candidateRepository
 */
const candidateHasSeenCertificationInstructions = async function ({ certificationCandidateId, candidateRepository }) {
  const certificationCandidate = await candidateRepository.get({ certificationCandidateId });

  if (!certificationCandidate) {
    throw new CertificationCandidateNotFoundError();
  }

  certificationCandidate.validateCertificationInstructions();

  return candidateRepository.update(certificationCandidate);
};

export { candidateHasSeenCertificationInstructions };
