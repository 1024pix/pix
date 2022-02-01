module.exports = async function getSessionCertificationReports({ sessionId, certificationReportRepository }) {
  return certificationReportRepository.findBySessionId(sessionId);
};
