/**
 * @typedef {import ('../../domain/usecases/index.js').SessionEnrolmentRepository} SessionEnrolmentRepository
 * @typedef {import ('../../domain/usecases/index.js').CertificationResultRepository} CertificationResultRepository
 */

/**
 * @param {Object} params
 * @param {SessionEnrolmentRepository} params.sessionEnrolmentRepository
 * @param {CertificationResultRepository} params.certificationResultRepository
 */
const getSessionResults = async function ({ sessionId, sessionEnrolmentRepository, certificationResultRepository }) {
  const session = await sessionEnrolmentRepository.get({ id: sessionId });
  const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

  return { session, certificationResults };
};

export { getSessionResults };
