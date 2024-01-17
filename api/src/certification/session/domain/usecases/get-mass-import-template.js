/**
 * @typedef {import('../../domain/usecases/index.js').CenterRepository} CenterRepository
 * @typedef {import('../models/Center.js').Center} Center
 * @typedef {import('../../../../shared/domain/errors.js').NotFoundError} NotFoundError
 */

/**
 * @param {Object} params
 * @param {number} params.certificationCenterId
 * @param {CenterRepository} params.centerRepository
 *
 * @returns {Center} related certification center
 * @throws {NotFoundError} a candidate is linked to an unexisting certification center
 */
const getMassImportTemplate = async ({ certificationCenterId, centerRepository }) => {
  return centerRepository.getById({ id: certificationCenterId });
};

export { getMassImportTemplate };
