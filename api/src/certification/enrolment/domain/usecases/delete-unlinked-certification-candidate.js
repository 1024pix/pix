/**
 * @typedef {import('./index.js').CertificationCandidateRepository} CertificationCandidateRepository
 */

import { CertificationCandidateForbiddenDeletionError } from '../errors.js';

/**
 * @param {Object} params
 * @param {CertificationCandidateRepository} params.certificationCandidateRepository
 */
const deleteUnlinkedCertificationCandidate = async function ({
  certificationCandidateId,
  certificationCandidateRepository,
}) {
  const isNotLinked = await certificationCandidateRepository.isNotLinked({ id: certificationCandidateId });

  if (isNotLinked) {
    return certificationCandidateRepository.remove({ id: certificationCandidateId });
  }

  throw new CertificationCandidateForbiddenDeletionError();
};

export { deleteUnlinkedCertificationCandidate };
