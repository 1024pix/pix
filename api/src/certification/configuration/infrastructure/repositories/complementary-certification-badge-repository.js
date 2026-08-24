import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

export async function getAllIdsByTargetProfileId({ targetProfileId }) {
  const knexConn = DomainTransaction.getConnection();

  return await knexConn('badges')
    .select('complementary-certification-badges')
    .leftJoin('complementary-certification-badges', 'complementary-certification-badges.badgeId', 'badges.id')
    .leftJoin('target-profiles', 'target-profiles.id', 'badges.targetProfileId')
    .where({ targetProfileId })
    .andWhere('complementary-certification-badges.detachedAt', null)
    .pluck('complementary-certification-badges.id');
}

export async function detachByIds({ complementaryCertificationBadgeIds }) {
  const knexConn = DomainTransaction.getConnection();
  const now = new Date();
  return knexConn('complementary-certification-badges')
    .whereIn('id', complementaryCertificationBadgeIds)
    .update({ detachedAt: now });
}

export async function attach({ complementaryCertificationBadges }) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn
    .batchInsert('complementary-certification-badges', complementaryCertificationBadges)
    .transacting(knexConn.isTransaction ? knexConn : null);
}

export async function countAttachableBadges({ ids }) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn
    .from('badges')
    .whereIn('badges.id', ids)
    .andWhere('badges.isCertifiable', true)
    .whereNotExists(
      knexConn
        .select(1)
        .from('complementary-certification-badges')
        .whereRaw('"complementary-certification-badges"."badgeId" = "badges"."id"'),
    )
    .count('id')
    .first();

  return result.count;
}
