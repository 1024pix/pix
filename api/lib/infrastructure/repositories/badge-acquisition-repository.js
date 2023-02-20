import bluebird from 'bluebird';
import { knex } from '../../../db/knex-database-connection';
import DomainTransaction from '../DomainTransaction';

const BADGE_ACQUISITIONS_TABLE = 'badge-acquisitions';

export default {
  async createOrUpdate({ badgeAcquisitionsToCreate = [], domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction.knexTransaction || knex;
    return bluebird.mapSeries(badgeAcquisitionsToCreate, async ({ badgeId, userId, campaignParticipationId }) => {
      const alreadyCreatedBadgeAcquisition = await knexConn(BADGE_ACQUISITIONS_TABLE)
        .select('id')
        .where({ badgeId, userId, campaignParticipationId });
      if (alreadyCreatedBadgeAcquisition.length === 0) {
        return knexConn(BADGE_ACQUISITIONS_TABLE).insert(badgeAcquisitionsToCreate);
      } else {
        return knexConn(BADGE_ACQUISITIONS_TABLE)
          .update({ updatedAt: knex.raw('CURRENT_TIMESTAMP') })
          .where({ userId, badgeId, campaignParticipationId });
      }
    });
  },

  async getAcquiredBadgeIds({ badgeIds, userId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction.knexTransaction || knex;
    return knexConn(BADGE_ACQUISITIONS_TABLE).pluck('badgeId').where({ userId }).whereIn('badgeId', badgeIds);
  },

  async getAcquiredBadgesByCampaignParticipations({
    campaignParticipationsIds,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    const knexConn = domainTransaction.knexTransaction || knex;
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
  },
};
