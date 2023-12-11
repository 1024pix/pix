import { usecases } from '../../../shared/domain/usecases/index.js';

/**
 * @function
 * @name getById
 *
 * @param {object} params
 * @param {number} params.id mandatory
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
