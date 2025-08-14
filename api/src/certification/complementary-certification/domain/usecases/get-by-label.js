import * as injectedComplementaryCertificationRepository from '../../infrastructure/repositories/complementary-certification-repository.js'; /**
 * @typedef {import ('../../domain/usecases/index.js').ComplementaryCertificationRepository} ComplementaryCertificationRepository
 */

/**
 * @param {Object} params
 * @param {string} params.label - complementary certification label
 * @param {ComplementaryCertificationRepository} params.complementaryCertificationRepository
 */
export const getByLabel = async ({
  label,
  complementaryCertificationRepository = injectedComplementaryCertificationRepository,
} = {}) => {
  return complementaryCertificationRepository.getByLabel({ label });
};
