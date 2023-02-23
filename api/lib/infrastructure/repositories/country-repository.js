const { Country } = require('../../domain/read-models/Country.js');
const { knex } = require('../../../db/knex-database-connection.js');

module.exports = {
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
