// @ts-check
/**
 * @typedef {import ('../../../shared/domain/models/ComplementaryCertificationKeys.js').ComplementaryCertificationKeys} ComplementaryCertificationKeys
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
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
 * @param {ComplementaryCertificationKeys} key
 * @returns {Promise<ComplementaryCertification>}
 */
export async function getByKey(key) {
  const knexConn = DomainTransaction.getConnection();
  const complementaryCertification = await knexConn.from('complementary-certifications').where({ key }).first();

  if (!complementaryCertification) {
    throw new NotFoundError('Complementary certification does not exist');
  }

  return _toDomain(complementaryCertification);
}

/**
 * @param {object} params
 * @param {number} params.id
 * @returns {Promise<ComplementaryCertification>}
 */
export async function getById({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const complementaryCertification = await knexConn.from('complementary-certifications').where({ id }).first();

  if (!complementaryCertification) {
    throw new NotFoundError('Complementary certification does not exist');
  }

  return _toDomain(complementaryCertification);
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
