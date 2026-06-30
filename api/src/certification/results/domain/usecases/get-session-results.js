/**
 * @typedef {import ('../../domain/usecases/index.js').CertificationResultRepository} CertificationResultRepository
 */

/**
 * @param {object} params
 * @param {CertificationResultRepository} params.certificationResultRepository
 */
const getSessionResults = async function ({ sessionId, certificationResultRepository }) {
  return await certificationResultRepository.findBySessionId({ sessionId });
};

export { getSessionResults };
