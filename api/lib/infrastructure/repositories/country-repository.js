import { Country } from '../../domain/read-models/Country';
import { knex } from '../../../db/knex-database-connection';

export default {
  async findAll() {
    const result = await knex
      .from('certification-cpf-countries')
      .select('commonName', 'code', 'matcher')
      .where('commonName', '=', knex.ref('originalName'))
      .orderBy('commonName', 'asc');

    return result.map(_toDomain);
  },
};

function _toDomain(row) {
  return new Country({
    ...row,
    name: row.commonName,
  });
}
