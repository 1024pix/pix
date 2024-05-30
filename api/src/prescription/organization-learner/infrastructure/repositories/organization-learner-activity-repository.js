import { knex } from '../../../../../db/knex-database-connection.js';
import { OrganizationLearnerActivity } from '../../domain/read-models/OrganizationLearnerActivity.js';
import { OrganizationLearnerParticipation } from '../../domain/read-models/OrganizationLearnerParticipation.js';

async function get(organizationLearnerId) {
  const organizationLearnerParticipations = await knex('campaign-participations')
    .select(
      'campaign-participations.id',
      'campaign-participations.createdAt',
      'campaign-participations.sharedAt',
      'campaign-participations.campaignId',
      'campaign-participations.status',
      'campaigns.name',
      'campaigns.type',
      knex('campaign-participations')
        .whereRaw('"campaignId" = "campaigns"."id"')
        .where('organizationLearnerId', organizationLearnerId)
        .whereNull('deletedAt')
        .groupBy('campaignId')
        .count()
        .as('participationsCount'),
      knex('campaign-participations')
        .select('campaign-participations.id')
        .whereRaw('"campaignId" = "campaigns"."id"')
        .where('organizationLearnerId', organizationLearnerId)
        .whereNull('deletedAt')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .as('lastCampaignParticipationId'),
    )
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .where('campaign-participations.organizationLearnerId', '=', organizationLearnerId)
    .where('campaign-participations.deletedAt', 'IS', null)
    .where('campaign-participations.isImproved', '=', false)
    .orderBy('campaign-participations.createdAt', 'desc');

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
        participationCount: participation.participationsCount,
        lastCampaignParticipationId: participation.lastCampaignParticipationId,
      }),
  );
  return new OrganizationLearnerActivity({ organizationLearnerId, participations });
}

export { get };
