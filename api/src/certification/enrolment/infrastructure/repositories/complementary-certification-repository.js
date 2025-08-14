/**
 * @typedef {import ('./index.js').ComplementaryCertificationApi} ComplementaryCertificationApi
 */
import { knex } from '../../../../../db/knex-database-connection.js';
import { ComplementaryCertification } from '../../domain/models/ComplementaryCertification.js';

import * as injectedComplementaryCertificationApi from '../../../complementary-certification/application/api/complementary-certification-api.js';

/**
 * @function
 * @param {Object} params
 * @param {number} params.label
 * @param {ComplementaryCertificationApi} params.complementaryCertificationApi
 *
 * @returns {ComplementaryCertification}
 * @throws {NotFoundError} Complementary certification does not exist
 */
const getByLabel = async function(
  { label, complementaryCertificationApi = injectedComplementaryCertificationApi } = {},
) {
  const complementaryCertification = await complementaryCertificationApi.getByLabel({
    label,
  });
  return _toDomain(complementaryCertification);
};

const findAll = async function () {
  const result = await knex.from('complementary-certifications').select('id', 'label', 'key').orderBy('id', 'asc');

  return result.map(_toDomain);
};

export { findAll, getByLabel };

function _toDomain(result) {
  return new ComplementaryCertification(result);
}
