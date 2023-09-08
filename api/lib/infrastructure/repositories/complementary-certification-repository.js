import { ComplementaryCertification } from '../../domain/models/index.js';
import { knex } from '../../../db/knex-database-connection.js';

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

const getById = async function ({ complementaryCertificationId }) {
  const complementaryCertification = await knex
    .from('complementary-certifications')
    .where({ id: complementaryCertificationId })
    .first();
  return _toDomain(complementaryCertification);
};

export { findAll, getByLabel, getById };
