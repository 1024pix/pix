/**
 * @typedef {import ('./index.js').CandidateRepository} CandidateRepository
 */
import { CertificationCandidateNotFoundError } from '../errors.js';

/**
 * @param {Object} params
 * @param {CandidateRepository} params.candidateRepository
 */
const candidateHasSeenCertificationInstructions = async function ({ certificationCandidateId, candidateRepository }) {
  const candidate = await candidateRepository.get({ certificationCandidateId });

  if (!candidate) {
    throw new CertificationCandidateNotFoundError();
  }

  candidate.validateCertificationInstructions();

  await candidateRepository.update(candidate);
};

export { candidateHasSeenCertificationInstructions };
