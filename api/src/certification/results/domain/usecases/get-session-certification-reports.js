/**
 * @typedef {import ('../../domain/usecases/index.js').CertificationReportRepository} CertificationReportRepository
 */

/**
 * @param {Object} params
 * @param {CertificationReportRepository} params.certificationReportRepository
 */
const getSessionCertificationReports = async function ({ sessionId, certificationReportRepository }) {
  return certificationReportRepository.findBySessionId({ sessionId });
};

export { getSessionCertificationReports };
