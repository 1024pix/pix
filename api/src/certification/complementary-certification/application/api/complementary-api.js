/**
 * @typedef {import ('../../../../shared/domain/errors.js').NotFoundError} NotFoundError
 */
import { usecases } from '../../domain/usecases/index.js';

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
export const getById = ({ id }) => {
  _assertIdExists(id);
  usecases.getComplementaryCertificationById();
  return;
};

const _assertIdExists = (id) => {
  if (!id) {
    throw new Error('Complementary certification id parameter is mandatory');
  }
};
