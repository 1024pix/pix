import * as injectedComplementaryCertificationRepository from '../../../complementary-certification/infrastructure/repositories/complementary-certification-repository.js'; /**
 * @typedef {import ('../../domain/usecases/index.js').ComplementaryCertificationRepository} ComplementaryCertificationRepository
 */

/**
 * @param {Object} params
 * @param {ComplementaryCertificationRepository} params.complementaryCertificationRepository
 */
const findComplementaryCertifications = function ({
  complementaryCertificationRepository = injectedComplementaryCertificationRepository,
} = {}) {
  return complementaryCertificationRepository.findAll();
};

export { findComplementaryCertifications };
