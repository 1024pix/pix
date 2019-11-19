const { BadRequestError } = require('../../domain/errors');

module.exports = async function importCertificationCandidatesFromAttendanceSheet({
  userId,
  sessionId,
  odsBuffer,
  certificationCandidatesOdsService,
  sessionRepository,
  certificationCandidateRepository,
}) {
  await sessionRepository.ensureUserHasAccessToSession(userId, sessionId);

  const linkedCandidateInSessionExists = await certificationCandidateRepository.doesLinkedCertificationCandidateInSessionExist({ sessionId });

  if (linkedCandidateInSessionExists) {
    throw new BadRequestError('At least one candidate is already linked to a user');
  }

  const certificationCandidates = await certificationCandidatesOdsService
    .extractCertificationCandidatesFromAttendanceSheet({ sessionId, odsBuffer });

  return certificationCandidateRepository.setSessionCandidates(sessionId, certificationCandidates);
};
