const CertificationCandidate = require('../models/CertificationCandidate');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = createCertificationCandidate;

async function createCertificationCandidate({ userId, sessionRepository, certificationCandidateRepository, certificationCandidate }) {

  const certificationCandidateWithSession = new CertificationCandidate(certificationCandidate);
  certificationCandidateWithSession.id = undefined;

  try {
    await sessionRepository.ensureUserHasAccessToSession(userId, certificationCandidateWithSession.sessionId);
  } catch (err) {
    throw new UserNotAuthorizedToAccessEntity(certificationCandidateWithSession.sessionId);
  }

  return certificationCandidateRepository.save(certificationCandidateWithSession);
}
