/**
 * @typedef {import ('../../../shared/domain/usecases/index.js').dependencies} deps
 */

/**
 * @param {Object} params
 * @param {deps['certificationCandidateRepository']} params.certificationCandidateRepository
 */
const getSessionCertificationCandidates = async function ({ sessionId, certificationCandidateRepository }) {
  return certificationCandidateRepository.findBySessionId(sessionId);
};

export { getSessionCertificationCandidates };
