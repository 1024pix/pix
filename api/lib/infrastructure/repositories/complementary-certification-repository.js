import ComplementaryCertification from '../../domain/models/ComplementaryCertification';
import { knex } from '../../../db/knex-database-connection';

function _toDomain(row) {
  return new ComplementaryCertification({
    ...row,
  });
}

export default {
  async findAll() {
    const result = await knex.from('complementary-certifications').select('id', 'label', 'key').orderBy('id', 'asc');

    return result.map(_toDomain);
  },

  async getByLabel({ label }) {
    const result = await knex.from('complementary-certifications').where({ label }).first();

    return _toDomain(result);
  },
};
