/**
 * @typedef {import ('../../../shared/domain/models/ComplementaryCertificationKeys.js').ComplementaryCertificationKeys} ComplementaryCertificationKeys
 */

import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';
import { ComplementaryCertification } from '../../domain/models/ComplementaryCertification.js';

function _toDomain(row) {
  const hasComplementaryReferential = row.key !== ComplementaryCertificationKeys.CLEA;
  return new ComplementaryCertification({
    ...row,
    hasComplementaryReferential,
  });
}

const findAll = async function () {
  const result = await knex.from('complementary-certifications').select('id', 'label', 'key').orderBy('id', 'asc');

  return result.map(_toDomain);
};

const getByLabel = async function ({ label }) {
  const complementaryCertification = await knex.from('complementary-certifications').where({ label }).first();

  if (!complementaryCertification) {
    throw new NotFoundError('Complementary certification does not exist');
  }

  return _toDomain(complementaryCertification);
};

/**
 * @param {ComplementaryCertificationKey} key
 * @returns {Promise<ComplementaryCertification>}
 */
const getByKey = async function (key) {
  const knexConn = DomainTransaction.getConnection();
  const complementaryCertification = await knexConn.from('complementary-certifications').where({ key }).first();

  if (!complementaryCertification) {
    throw new NotFoundError('Complementary certification does not exist');
  }

  return _toDomain(complementaryCertification);
};

const getById = async function ({ id }) {
  const complementaryCertification = await knex.from('complementary-certifications').where({ id }).first();

  if (!complementaryCertification) {
    throw new NotFoundError('Complementary certification does not exist');
  }

  return _toDomain(complementaryCertification);
};

export { findAll, getById, getByKey, getByLabel };
