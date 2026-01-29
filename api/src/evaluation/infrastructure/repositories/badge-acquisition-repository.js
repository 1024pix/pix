import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

const BADGE_TABLE = 'badges';
const BADGE_ACQUISITIONS_TABLE = 'badge-acquisitions';
import { knex } from '../../../../db/knex-database-connection.js';

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

/**
 * @param {number[]} campaignParticipationIds
 */
const deleteUserIdOnNonCertifiableBadgesForCampaignParticipations = async (campaignParticipationIds) => {
  const knexConnection = DomainTransaction.getConnection();
  return knexConnection(BADGE_ACQUISITIONS_TABLE)
    .update({ userId: null })
    .updateFrom(BADGE_TABLE)
    .where(`${BADGE_ACQUISITIONS_TABLE}.badgeId`, knex.raw('??', [`${BADGE_TABLE}.id`]))
    .where(`${BADGE_TABLE}.isCertifiable`, '=', false)
    .whereIn(`${BADGE_ACQUISITIONS_TABLE}.campaignParticipationId`, campaignParticipationIds);
};

const getAcquiredBadgeIds = async function ({ badgeIds, userId }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn(BADGE_ACQUISITIONS_TABLE).pluck('badgeId').where({ userId }).whereIn('badgeId', badgeIds);
};

/**
 * @param {number[]} campaignParticipationsIds
 */
const getAcquiredBadgesForCampaignParticipations = (campaignParticipationsIds) =>
  DomainTransaction.getConnection()(BADGE_ACQUISITIONS_TABLE)
    .where(`${BADGE_ACQUISITIONS_TABLE}.campaignParticipationId`, 'IN', campaignParticipationsIds)
    .orderBy(`${BADGE_ACQUISITIONS_TABLE}.id`);

const getAcquiredBadgesByCampaignParticipations = async function ({ campaignParticipationsIds }) {
  const knexConn = DomainTransaction.getConnection();
  const badges = await knexConn(BADGE_TABLE)
    .distinct(`${BADGE_TABLE}.id`)
    .select(`${BADGE_ACQUISITIONS_TABLE}.campaignParticipationId AS campaignParticipationId`, `${BADGE_TABLE}.*`)
    .from(BADGE_TABLE)
    .join(BADGE_ACQUISITIONS_TABLE, `${BADGE_TABLE}.id`, `${BADGE_ACQUISITIONS_TABLE}.badgeId`)
    .where(`${BADGE_ACQUISITIONS_TABLE}.campaignParticipationId`, 'IN', campaignParticipationsIds)
    .orderBy(`${BADGE_TABLE}.id`);

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

export {
  createOrUpdate,
  deleteUserIdOnNonCertifiableBadgesForCampaignParticipations,
  getAcquiredBadgeIds,
  getAcquiredBadgesByCampaignParticipations,
  getAcquiredBadgesForCampaignParticipations,
};
