import { Country } from '../../domain/read-models/Country.js';
import { knex } from '../../../db/knex-database-connection.js';

const findAll = async function () {
  const result = await knex
    .from('certification-cpf-countries')
    .select('commonName', 'code', 'matcher')
    .where('commonName', '=', knex.ref('originalName'))
    .orderBy('commonName', 'asc');

  return result.map(_toDomain);
};

export { findAll };

function _toDomain(row) {
  return new Country({
    ...row,
    name: row.commonName,
  });
}
