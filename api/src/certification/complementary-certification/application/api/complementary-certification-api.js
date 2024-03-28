/**
 * @typedef {import ('../../../../shared/domain/errors.js').NotFoundError} NotFoundError
 */
import { usecases } from '../../domain/usecases/index.js';
import { ComplementaryCertification } from './models/ComplementaryCertification.js';

/**
 * @function
 * @name getById
 *
 * @param {object} params
 * @param {number} params.id <mandatory> complementary certification identifier
 *
 * @returns {ComplementaryCertification}
 * @throws {NotFoundError} Complementary certification does not exist
 */
export const getById = async ({ id }) => {
  const complementaryCertification = await usecases.getById({ id });
  return new ComplementaryCertification(complementaryCertification);
};

/**
 * @function
 * @name getByLabel
 *
 * @param {object} params
 * @param {number} params.label mandatory
 *
 * @returns {ComplementaryCertification}
 * @throws {NotFoundError} Complementary certification does not exist
 */
export const getByLabel = async ({ label }) => {
  const complementaryCertification = await usecases.getByLabel({ label });
  return new ComplementaryCertification(complementaryCertification);
};
