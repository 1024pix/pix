/**
 * @typedef {import ('./index.js').ComplementaryCertificationApi} ComplementaryCertificationApi
 */
import { ComplementaryCertification } from '../../domain/models/ComplementaryCertification.js';

/**
 * @function
 * @param {Object} params
 * @param {number} params.complementaryCertificationId
 * @param {ComplementaryCertificationApi} params.complementaryCertificationApi
 *
 * @returns {ComplementaryCertification}
 * @throws {NotFoundError} Complementary certification does not exist
 */
const getById = async function ({ complementaryCertificationId, complementaryCertificationApi }) {
  const complementaryCertification = await complementaryCertificationApi.getById({ id: complementaryCertificationId });
  return _toDomain(complementaryCertification);
};

export { getById };

function _toDomain(result) {
  return new ComplementaryCertification(result);
}
