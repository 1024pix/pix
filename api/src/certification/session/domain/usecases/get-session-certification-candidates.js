/**
 * @typedef {import('../../../shared/domain/usecases/index.js').CertificationCandidateRepository} CertificationCandidateRepository
 */

/**
 * @param {Object} params
 * @param {CertificationCandidateRepository} params.certificationCandidateRepository
 */
const getSessionCertificationCandidates = async function ({ sessionId, certificationCandidateRepository }) {
  return certificationCandidateRepository.findBySessionId(sessionId);
};

export { getSessionCertificationCandidates };
