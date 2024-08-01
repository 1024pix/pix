/**
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').EnrolledCandidateRepository} EnrolledCandidateRepository
 * @typedef {import('./index.js').CertificationCenterRepository} CertificationCenterRepository
 */

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {EnrolledCandidateRepository} params.enrolledCandidateRepository
 * @param {CertificationCenterRepository} params.certificationCenterRepository
 */
const getCandidateImportSheetData = async function ({
  sessionId,
  sessionRepository,
  enrolledCandidateRepository,
  certificationCenterRepository,
}) {
  const session = await sessionRepository.get({ id: sessionId });
  const enrolledCandidates = await enrolledCandidateRepository.findBySessionId({ sessionId });
  const certificationCenter = await certificationCenterRepository.getBySessionId({ sessionId });

  return {
    session,
    enrolledCandidates,
    certificationCenterHabilitations: certificationCenter.habilitations,
    isScoCertificationCenter: certificationCenter.isSco,
  };
};

export { getCandidateImportSheetData };
