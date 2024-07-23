/**
 * @typedef {import('./index.js').SharedSessionRepository} SharedSessionRepository
 * @typedef {import('./index.js').CertificationCenterRepository} CertificationCenterRepository
 */

/**
 * @param {Object} params
 * @param {sharedSessionRepository} params.sharedSessionRepository
 * @param {certificationCenterRepository} params.certificationCenterRepository
 */
const getCandidateImportSheetData = async function ({
  sessionId,
  sharedSessionRepository,
  certificationCenterRepository,
}) {
  const session = await sharedSessionRepository.getWithCertificationCandidates({ id: sessionId });
  const certificationCenter = await certificationCenterRepository.getBySessionId({ sessionId });

  return {
    session,
    certificationCenterHabilitations: certificationCenter.habilitations,
    isScoCertificationCenter: certificationCenter.isSco,
  };
};

export { getCandidateImportSheetData };
