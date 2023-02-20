export default async function getSessionCertificationCandidates({ sessionId, certificationCandidateRepository }) {
  return certificationCandidateRepository.findBySessionId(sessionId);
}
