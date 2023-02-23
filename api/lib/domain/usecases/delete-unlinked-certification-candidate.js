const { CertificationCandidateForbiddenDeletionError } = require('../errors.js');

module.exports = async function deleteUnlinkedCertificationCandidate({
  certificationCandidateId,
  certificationCandidateRepository,
}) {
  const isNotLinked = await certificationCandidateRepository.isNotLinked(certificationCandidateId);

  if (isNotLinked) {
    return certificationCandidateRepository.delete(certificationCandidateId);
  }

  throw new CertificationCandidateForbiddenDeletionError();
};
