const getSessionCertificationReports = async function ({ sessionId, certificationReportRepository }) {
  return certificationReportRepository.findBySessionId(sessionId);
};

export { getSessionCertificationReports };
