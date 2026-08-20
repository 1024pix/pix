/**
 * @typedef {import ('../../domain/usecases/index.js').CertificationResultRepository} CertificationResultRepository
 */

/**
 * @param {object} params
 * @param {CertificationResultRepository} params.certificationResultRepository
 */
export async function getSessionResults({ sessionId, certificationResultRepository }) {
  return await certificationResultRepository.findBySessionId({ sessionId });
}
