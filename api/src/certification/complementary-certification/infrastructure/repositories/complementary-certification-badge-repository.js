import { knex } from '../../../../../db/knex-database-connection.js';

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

export { getAllIdsByTargetProfileId, detachByIds, attach };
