/**
 * @typedef {import ('../../../../shared/domain/errors.js').NotFoundError} NotFoundError
 */
import { usecases } from '../../domain/usecases/index.js';
import { ComplementaryCertification } from './models/ComplementaryCertification.js';

/**
 * @function
 * @name getById
 *
 * @param {number} id mandatory
 *
 * @throws {NotFoundError} Complementary certification does not exist
 * @throws {Error} Id parameter was not provided
 */
export const getLabelById = async (id) => {
  _assertIdExists(id);
  const complementaryCertificationDTO = await usecases.getById({ id });
  return new ComplementaryCertification(complementaryCertificationDTO);
};

const _assertIdExists = (id) => {
  if (!id) {
    throw new Error('Complementary certification id parameter is mandatory');
  }
};
