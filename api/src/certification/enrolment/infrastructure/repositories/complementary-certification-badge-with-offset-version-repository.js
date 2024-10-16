import { knex } from '../../../../../db/knex-database-connection.js';
import { ComplementaryCertificationBadgeWithOffsetVersion } from '../../domain/models/ComplementaryCertificationBadge.js';

export async function getAllWithSameTargetProfile({ complementaryCertificationBadgeId }) {
  const results = await knex('complementary-certification-badges')
    .select(
      'complementary-certification-badges.id',
      'complementary-certification-badges.minimumEarnedPix',
      'complementary-certification-badges.level',
      'complementary-certification-badges.label',
      'complementary-certification-badges.imageUrl',
      'complementary-certification-badges.detachedAt',
      knex.raw(
        '(rank() over (partition by "complementaryCertificationId", "level" ORDER BY "detachedAt" DESC NULLS FIRST)) - 1 as "offsetVersion"',
      ),
      knex.raw(
        ' (first_value("complementary-certification-badges"."id") over (partition by "complementaryCertificationId", "level" ORDER BY "detachedAt" DESC NULLS FIRST)) as "currentAttachedComplementaryCertificationBadgeId"',
      ),
    )
    .join('badges', 'badges.id', '=', 'complementary-certification-badges.badgeId')
    .where(
      'badges.targetProfileId',
      '=',
      knex('complementary-certification-badges')
        .select('target-profiles.id')
        .join('badges', 'badges.id', '=', 'complementary-certification-badges.badgeId')
        .join('target-profiles', 'target-profiles.id', '=', 'badges.targetProfileId')
        .where('complementary-certification-badges.id', '=', complementaryCertificationBadgeId),
    )
    .orderBy('complementary-certification-badges.id');

  return results.map(_toDomain);
}

function _toDomain(data) {
  return new ComplementaryCertificationBadgeWithOffsetVersion({
    id: data.id,
    requiredPixScore: data?.minimumEarnedPix || 0,
    offsetVersion: data.offsetVersion,
    level: data.level,
    label: data.label,
    imageUrl: data.imageUrl,
    isOutdated: !!data.detachedAt,
    currentAttachedComplementaryCertificationBadgeId: data.currentAttachedComplementaryCertificationBadgeId,
  });
}
