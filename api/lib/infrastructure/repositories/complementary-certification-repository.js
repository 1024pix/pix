const ComplementaryCertification = require('../../domain/models/ComplementaryCertification');
const { knex } = require('../bookshelf');

function _toDomain(row) {
  return new ComplementaryCertification({
    ...row,
  });
}

module.exports = {
  async findAll() {
    const result = await knex.from('complementary-certifications').select('id', 'name').orderBy('id', 'asc');

    return result.map(_toDomain);
  },
};
