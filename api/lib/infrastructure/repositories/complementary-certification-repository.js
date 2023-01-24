const ComplementaryCertification = require('../../domain/models/ComplementaryCertification');
const { knex } = require('../../../db/knex-database-connection');

function _toDomain(row) {
  return new ComplementaryCertification({
    ...row,
  });
}

module.exports = {
  async findAll() {
    const result = await knex.from('complementary-certifications').select('id', 'label', 'key').orderBy('id', 'asc');

    return result.map(_toDomain);
  },

  async getByLabel({ label }) {
    const result = await knex.from('complementary-certifications').where({ label }).first();

    return _toDomain(result);
  },
};
