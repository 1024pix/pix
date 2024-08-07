/**
 * @typedef {import('./index.js').CandidateRepository} candidateRepository
 */

import { CertificationCandidateForbiddenDeletionError } from '../errors.js';

/**
 * @param {Object} params
 * @param {CandidateRepository} params.candidateRepository
 */
const deleteUnlinkedCertificationCandidate = async function ({ candidateId, candidateRepository }) {
  const candidate = await candidateRepository.get({ certificationCandidateId: candidateId });

  if (!candidate.isLinkedToAUser()) {
    return candidateRepository.remove({ id: candidateId });
  }

  throw new CertificationCandidateForbiddenDeletionError();
};

export { deleteUnlinkedCertificationCandidate };
