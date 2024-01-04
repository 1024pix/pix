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
 * @throws {Error} Id parameter was not provided
 */
export const getById = async ({ id }) => {
  _assertIdExists(id);
  const complementaryCertification = await usecases.getById({ id });
  return new ComplementaryCertification(complementaryCertification);
};

const _assertIdExists = (id) => {
  if (!id) {
    throw new Error('Complementary certification id parameter is mandatory');
  }
};
