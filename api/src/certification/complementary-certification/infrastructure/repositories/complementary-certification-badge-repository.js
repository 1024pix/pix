import { knex } from '../../../../../db/knex-database-connection.js';
import { Badge } from '../../../../../lib/domain/models/Badge.js';

const getAllIdsByTargetProfileId = async function ({ targetProfileId }) {
  const complementaryCertificationBadgesIds = await knex('badges')
    .select('complementary-certification-badges')
    .leftJoin('complementary-certification-badges', 'complementary-certification-badges.badgeId', 'badges.id')
    .leftJoin('target-profiles', 'target-profiles.id', 'badges.targetProfileId')
    .where({ targetProfileId })
    .andWhere('complementary-certification-badges.detachedAt', null)
    .pluck('complementary-certification-badges.id');
  return complementaryCertificationBadgesIds;
};

const detachByIds = async function ({ complementaryCertificationBadgeIds, domainTransaction }) {
  const knexConn = domainTransaction.knexTransaction;

  const now = new Date();

  return knexConn('complementary-certification-badges')
    .whereIn('id', complementaryCertificationBadgeIds)
    .update({ detachedAt: now });
};

const attach = async function ({ domainTransaction, complementaryCertificationBadges }) {
  const knexConn = domainTransaction.knexTransaction;
  const createdAt = new Date();

  for (const complementaryCertificationBadge of complementaryCertificationBadges) {
    await knexConn('complementary-certification-badges').insert({
      ...complementaryCertificationBadge,
      createdAt,
    });
  }
};

const findAttachableBadgesByIds = async function ({ ids }) {
  const badges = await knex
    .from('badges')
    .whereIn('badges.id', ids)
    .whereNotExists(
      knex
        .select(1)
        .from('complementary-certification-badges')
        .whereRaw('"complementary-certification-badges"."badgeId" = "badges"."id"'),
    );

  return badges.map((badge) => {
    return new Badge(badge);
  });
};

export { getAllIdsByTargetProfileId, detachByIds, attach, findAttachableBadgesByIds };
