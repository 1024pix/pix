import * as injectedComplementaryCertificationRepository from '../../infrastructure/repositories/complementary-certification-repository.js'; /**
 * @typedef {import ('../../domain/usecases/index.js').ComplementaryCertificationRepository} ComplementaryCertificationRepository
 */

/**
 * @param {Object} params
 * @param {number} params.id - complementary certification id
 * @param {ComplementaryCertificationRepository} params.complementaryCertificationRepository
 */
export const getById = async ({
  id,
  complementaryCertificationRepository = injectedComplementaryCertificationRepository,
} = {}) => {
  return complementaryCertificationRepository.getById({ id });
};
