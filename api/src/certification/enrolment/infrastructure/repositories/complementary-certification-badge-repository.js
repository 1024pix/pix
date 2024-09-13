import { knex } from '../../../../../db/knex-database-connection.js';
import { ComplementaryCertificationBadge } from '../../domain/models/ComplementaryCertificationBadge.js';

export async function findAll() {
  const results = await knex('complementary-certification-badges').select('id', 'minimumEarnedPix').orderBy('id');
  return results.map(_toDomain);
}

function _toDomain(data) {
  return new ComplementaryCertificationBadge({
    id: data.id,
    requiredPixScore: data.minimumEarnedPix,
  });
}
