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
 * @param {number} params.id mandatory
 *
 * @throws {NotFoundError} Complementary certification does not exist
 */
export const getById = async ({ id }) => {
  const complementaryCertification = await usecases.getById({ id });
  return new ComplementaryCertification(complementaryCertification);
};
