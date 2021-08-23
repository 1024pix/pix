module.exports = function getSessionCertificationReports({ sessionId, certificationReportRepository }) {
  return certificationReportRepository.findBySessionId(sessionId);
};
