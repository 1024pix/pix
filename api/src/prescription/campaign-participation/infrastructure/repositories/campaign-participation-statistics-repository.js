import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';

const participationNeitherDeletedNorImproved = (queryBuilder) =>
  queryBuilder.whereNull('campaign-participations.deletedAt').where('campaign-participations.isImproved', false);

const campaignNeitherDeletedNorArchived = (queryBuilder) =>
  queryBuilder.whereNull('campaigns.deletedAt').whereNull('campaigns.archivedAt');

/**
 * Get the count of participations on all prescriber campaigns
 *
 * @param {number} organizationId - The ID of the organization
 * @param {number} ownerId - The ID of the prescriber
 * @returns {Promise}
 */
const getParticipationCountOnPrescriberCampaigns = async function (organizationId, ownerId) {
  const knexConnection = DomainTransaction.getConnection();

  return knexConnection('campaign-participations')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .select(
      knex.raw('count(*) as "totalParticipationCount"'),
      knex.raw(
        `count(*) filter (where "status" = ?) as "completedParticipationCount"`,
        CampaignParticipationStatuses.SHARED,
      ),
      knex.raw(
        `count(*) filter (where "sharedAt" >= NOW() - INTERVAL '30 days') as "sharedParticipationCountLastThirtyDays"`,
      ),
    )
    .where(participationNeitherDeletedNorImproved)
    .where(campaignNeitherDeletedNorArchived)
    .where({
      'campaigns.organizationId': organizationId,
      'campaigns.ownerId': ownerId,
    })
    .first();
};

export { getParticipationCountOnPrescriberCampaigns };
