const { CertificationCandidateAlreadyLinkedToUserError } = require('../../domain/errors');

module.exports = async function importCertificationCandidatesFromAttendanceSheet({
  sessionId,
  odsBuffer,
  certificationCandidatesOdsService,
  certificationCandidateRepository,
}) {
  const linkedCandidateInSessionExists = await certificationCandidateRepository.doesLinkedCertificationCandidateInSessionExist({ sessionId });

  if (linkedCandidateInSessionExists) {
    throw new CertificationCandidateAlreadyLinkedToUserError('At least one candidate is already linked to a user');
  }

  const certificationCandidates = await certificationCandidatesOdsService
    .extractCertificationCandidatesFromAttendanceSheet({ sessionId, odsBuffer });

  return certificationCandidateRepository.setSessionCandidates(sessionId, certificationCandidates);
};
