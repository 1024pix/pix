import { ComplementaryCertification } from '../../domain/models/ComplementaryCertification.js';
import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';

function _toDomain(row) {
  return new ComplementaryCertification({
    ...row,
  });
}

const findAll = async function () {
  const result = await knex.from('complementary-certifications').select('id', 'label', 'key').orderBy('id', 'asc');

  return result.map(_toDomain);
};

const getByLabel = async function ({ label }) {
  const result = await knex.from('complementary-certifications').where({ label }).first();

  return _toDomain(result);
};

const getById = async function ({ id }) {
  const complementaryCertification = await knex.from('complementary-certifications').where({ id }).first();

  if (!complementaryCertification) {
    throw new NotFoundError('Complementary certification does not exist');
  }

  return _toDomain(complementaryCertification);
};

export { findAll, getByLabel, getById };
