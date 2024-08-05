/**
 * @typedef {import('./index.js').CandidateRepository} candidateRepository
 */

import { CertificationCandidateForbiddenDeletionError } from '../errors.js';

/**
 * @param {Object} params
 * @param {CandidateRepository} params.candidateRepository
 */
const deleteUnlinkedCertificationCandidate = async function ({ candidateId, candidateRepository }) {
  const isNotLinked = await candidateRepository.isNotLinked({ id: candidateId });

  if (isNotLinked) {
    return candidateRepository.remove({ id: candidateId });
  }

  throw new CertificationCandidateForbiddenDeletionError();
};

export { deleteUnlinkedCertificationCandidate };
