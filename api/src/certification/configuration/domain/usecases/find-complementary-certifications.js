/**
 * @typedef {import ('../../domain/usecases/index.js').ComplementaryCertificationRepository} ComplementaryCertificationRepository
 */

/**
 * @param {object} params
 * @param {ComplementaryCertificationRepository} params.complementaryCertificationRepository
 */
export function findComplementaryCertifications({ complementaryCertificationRepository }) {
  return complementaryCertificationRepository.findAll();
}
