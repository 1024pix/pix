import { CertificationCandidateForbiddenDeletionError } from '../errors.js';

const deleteUnlinkedCertificationCandidate = async function ({
  certificationCandidateId,
  certificationCandidateRepository,
}) {
  const isNotLinked = await certificationCandidateRepository.isNotLinked(certificationCandidateId);

  if (isNotLinked) {
    return certificationCandidateRepository.delete(certificationCandidateId);
  }

  throw new CertificationCandidateForbiddenDeletionError();
};

export { deleteUnlinkedCertificationCandidate };
