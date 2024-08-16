/**
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').EnrolledCandidateRepository} EnrolledCandidateRepository
 * @typedef {import('./index.js').CenterRepository} CenterRepository
 */

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {EnrolledCandidateRepository} params.enrolledCandidateRepository
 * @param {CenterRepository} params.centerRepository
 */
const getCandidateImportSheetData = async function ({
  sessionId,
  sessionRepository,
  enrolledCandidateRepository,
  centerRepository,
}) {
  const session = await sessionRepository.get({ id: sessionId });
  const enrolledCandidates = await enrolledCandidateRepository.findBySessionId({ sessionId });
  const center = await centerRepository.getById({ id: session.certificationCenterId });
  return {
    session,
    enrolledCandidates,
    certificationCenterHabilitations: center.habilitations,
    isScoCertificationCenter: center.isSco,
  };
};

export { getCandidateImportSheetData };
