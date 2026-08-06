/**
 * @typedef {import ('../../domain/usecases/index.js').CertificationReportRepository} CertificationReportRepository
 */

/**
 * @param {object} params
 * @param {CertificationReportRepository} params.certificationReportRepository
 */
export async function getSessionCertificationReports({ sessionId, certificationReportRepository }) {
  return certificationReportRepository.findBySessionId({ sessionId });
}
