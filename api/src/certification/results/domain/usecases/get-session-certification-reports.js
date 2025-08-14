import * as injectedCertificationReportRepository from '../../../shared/infrastructure/repositories/certification-report-repository.js'; /**
 * @typedef {import ('../../domain/usecases/index.js').CertificationReportRepository} CertificationReportRepository
 */

/**
 * @param {Object} params
 * @param {CertificationReportRepository} params.certificationReportRepository
 */
const getSessionCertificationReports = async function ({
  sessionId,
  certificationReportRepository = injectedCertificationReportRepository,
} = {}) {
  return certificationReportRepository.findBySessionId({ sessionId });
};

export { getSessionCertificationReports };
