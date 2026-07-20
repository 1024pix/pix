// @ts-check
/**
 * @typedef {import ('../../../shared/domain/models/ComplementaryCertificationKeys.js').ComplementaryCertificationKeys} ComplementaryCertificationKeys
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ComplementaryCertification } from '../../../shared/domain/models/ComplementaryCertification.js';

/**
 * @returns {Promise<Array<ComplementaryCertification>>}
 */
export async function findAll() {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn.from('complementary-certifications').select('id', 'label', 'key').orderBy('id', 'asc');

  return result.map(_toDomain);
}

/**
 * @param {object} row
 * @param {number} row.id
 * @param {string} row.label
 * @param {ComplementaryCertificationKeys} row.key
 * @returns {ComplementaryCertification}
 */
function _toDomain(row) {
  return new ComplementaryCertification({
    ...row,
  });
}
