const Accreditation = require('../../domain/models/Accreditation');
const { knex } = require('../bookshelf');

function _toDomain(row) {
  return new Accreditation({
    ...row,
  });
}

module.exports = {
  async findAll() {
    const result = await knex.from('complementary-certifications').select('id', 'name').orderBy('id', 'asc');

    return result.map(_toDomain);
  },
};
