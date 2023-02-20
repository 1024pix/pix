export default async function getSessionCertificationReports({ sessionId, certificationReportRepository }) {
  return certificationReportRepository.findBySessionId(sessionId);
}
