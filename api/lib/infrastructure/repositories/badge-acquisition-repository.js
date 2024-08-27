import { knex } from '../../../db/knex-database-connection.js';
import { DomainTransaction } from '../DomainTransaction.js';

const BADGE_ACQUISITIONS_TABLE = 'badge-acquisitions';

const createOrUpdate = async function ({ badgeAcquisitionsToCreate = [] }) {
  const knexConn = DomainTransaction.getConnection();

  for (const badgeAcquisitionToCreate of badgeAcquisitionsToCreate) {
    const { badgeId, userId, campaignParticipationId } = badgeAcquisitionToCreate;

    const alreadyCreatedBadgeAcquisition = await knexConn(BADGE_ACQUISITIONS_TABLE)
      .select('id')
      .where({ badgeId, userId, campaignParticipationId });

    if (alreadyCreatedBadgeAcquisition.length === 0) {
      await knexConn(BADGE_ACQUISITIONS_TABLE).insert(badgeAcquisitionsToCreate);
    } else {
      await knexConn(BADGE_ACQUISITIONS_TABLE)
        .update({ updatedAt: knex.raw('CURRENT_TIMESTAMP') })
        .where({ userId, badgeId, campaignParticipationId });
    }
  }
};

const getAcquiredBadgeIds = async function ({ badgeIds, userId }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn(BADGE_ACQUISITIONS_TABLE).pluck('badgeId').where({ userId }).whereIn('badgeId', badgeIds);
};

const getAcquiredBadgesByCampaignParticipations = async function ({ campaignParticipationsIds }) {
  const knexConn = DomainTransaction.getConnection();
  const badges = await knexConn('badges')
    .distinct('badges.id')
    .select('badge-acquisitions.campaignParticipationId AS campaignParticipationId', 'badges.*')
    .from('badges')
    .join(BADGE_ACQUISITIONS_TABLE, 'badges.id', 'badge-acquisitions.badgeId')
    .where('badge-acquisitions.campaignParticipationId', 'IN', campaignParticipationsIds)
    .orderBy('badges.id');

  const acquiredBadgesByCampaignParticipations = {};
  for (const badge of badges) {
    if (acquiredBadgesByCampaignParticipations[badge.campaignParticipationId]) {
      acquiredBadgesByCampaignParticipations[badge.campaignParticipationId].push(badge);
    } else {
      acquiredBadgesByCampaignParticipations[badge.campaignParticipationId] = [badge];
    }
  }
  return acquiredBadgesByCampaignParticipations;
};

export { createOrUpdate, getAcquiredBadgeIds, getAcquiredBadgesByCampaignParticipations };
