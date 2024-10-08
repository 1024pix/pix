import { knex } from '../../../../../db/knex-database-connection.js';
import { ComplementaryCertificationBadge } from '../../domain/models/ComplementaryCertificationBadge.js';

/**
 *
 * @deprecated doesn't work for multiple target profile on same complementary certification. Should be grouped by targetProfileIds
 */
export async function findAll() {
  const results = await knex('complementary-certification-badges')
    .select(
      'id',
      'minimumEarnedPix',
      knex.raw(
        '(rank() over (partition by "complementaryCertificationId", "level" ORDER BY "detachedAt" DESC NULLS FIRST)) - 1 as "offsetVersion"',
      ),
      knex.raw(
        ' (first_value("id") over (partition by "complementaryCertificationId", "level" ORDER BY "detachedAt" DESC NULLS FIRST)) as "currentAttachedComplementaryCertificationBadgeId"',
      ),
    )

    .orderBy('id');
  return results.map(_toDomain);
}

function _toDomain(data) {
  return new ComplementaryCertificationBadge({
    id: data.id,
    requiredPixScore: data.minimumEarnedPix,
    offsetVersion: data.offsetVersion,
    currentAttachedComplementaryCertificationBadgeId: data.currentAttachedComplementaryCertificationBadgeId,
  });
}
