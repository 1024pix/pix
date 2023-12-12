/**
 * @typedef {import ('../../../shared/domain/usecases/index.js').ComplementaryCertificationRepository} ComplementaryCertificationRepository
 */

/**
 * @param {Object} params
 * @param {number} params.id - complementary certification id
 * @param {ComplementaryCertificationRepository} params.complementaryCertificationRepository
 */
export const getComplementaryCertificationById = async ({ id, complementaryCertificationRepository }) => {
  return complementaryCertificationRepository.getById({ id });
};
