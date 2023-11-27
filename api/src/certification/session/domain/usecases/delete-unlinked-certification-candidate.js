/**
 * @typedef {import ('../../../shared/domain/usecases/index.js').dependencies} deps
 */

import { CertificationCandidateForbiddenDeletionError } from '../errors.js';

/**
 * @param {Object} params
 * @param {deps['certificationCandidateRepository']} params.certificationCandidateRepository
 */
const deleteUnlinkedCertificationCandidate = async function ({
  certificationCandidateId,
  certificationCandidateRepository,
}) {
  const isNotLinked = await certificationCandidateRepository.isNotLinked(certificationCandidateId);

  if (isNotLinked) {
    return certificationCandidateRepository.remove(certificationCandidateId);
  }

  throw new CertificationCandidateForbiddenDeletionError();
};

export { deleteUnlinkedCertificationCandidate };
