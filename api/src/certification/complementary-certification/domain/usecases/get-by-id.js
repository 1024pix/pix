/**
 * @typedef {import ('../../domain/usecases/index.js').ComplementaryCertificationRepository} ComplementaryCertificationRepository
 */

/**
 * @param {Object} params
 * @param {number} params.id - complementary certification id
 * @param {ComplementaryCertificationRepository} params.complementaryCertificationRepository
 *
 * @returns {ComplementaryCertificationDTO}
 */
export const getById = async ({ id, complementaryCertificationRepository }) => {
  return complementaryCertificationRepository.getById({ id });
};
