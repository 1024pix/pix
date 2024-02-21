import { knex } from '../../../../../db/knex-database-connection.js';
import { OrganizationLearnerParticipation } from '../../domain/read-models/OrganizationLearnerParticipation.js';
import { OrganizationLearnerActivity } from '../../domain/read-models/OrganizationLearnerActivity.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';

async function get(organizationLearnerId) {
  const organizationLearnerParticipations = await knex('campaign-participations')
    .select(
      'campaign-participations.id',
      'campaign-participations.createdAt',
      'campaign-participations.sharedAt',
      'campaign-participations.status',
      'campaigns.name',
      'campaigns.type',
      'campaign-participations.campaignId',
      knex('campaign-participations')
        .select('campaign-participations.id')
        .whereRaw('"campaignId" = "campaigns"."id"')
        .where('organizationLearnerId', organizationLearnerId)
        .and.where('status', CampaignParticipationStatuses.SHARED)
        .whereNull('deletedAt')
        .orderBy('sharedAt', 'desc')
        .limit(1)
        .as('lastSharedCampaignsParticipationId'),
    )
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .where('campaign-participations.organizationLearnerId', '=', organizationLearnerId)
    .where('campaign-participations.deletedAt', 'IS', null)
    .where('campaign-participations.isImproved', '=', false)
    .orderBy('campaign-participations.createdAt', 'desc');

  const participationsCount = await knex('campaign-participations')
    .select('campaignId')
    .where('organizationLearnerId', organizationLearnerId)
    .whereNull('deletedAt')
    .groupBy('campaignId')
    .count();

  const participations = organizationLearnerParticipations.map(
    (participation) =>
      new OrganizationLearnerParticipation({
        id: participation.id,
        createdAt: participation.createdAt,
        sharedAt: participation.sharedAt,
        status: participation.status,
        campaignName: participation.name,
        campaignType: participation.type,
        campaignId: participation.campaignId,
        participationCount: participationsCount.find(
          (participationCount) => participationCount.campaignId === participation.campaignId,
        ).count,
        lastSharedOrCurrentCampaignParticipationId: participation.lastSharedCampaignsParticipationId,
      }),
  );
  return new OrganizationLearnerActivity({ organizationLearnerId, participations });
}

export { get };
