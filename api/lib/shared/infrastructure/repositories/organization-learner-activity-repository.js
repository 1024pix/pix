import { knex } from '../../../../db/knex-database-connection.js';
import { OrganizationLearnerParticipation } from '../../domain/read-models/OrganizationLearnerParticipation.js';
import { OrganizationLearnerActivity } from '../../domain/read-models/OrganizationLearnerActivity.js';

async function get(organizationLearnerId) {
  const organizationLearnerParticipations = await knex('campaign-participations')
    .select(
      'campaign-participations.id',
      'campaign-participations.createdAt',
      'campaign-participations.sharedAt',
      'campaign-participations.status',
      'campaigns.name',
      'campaigns.type',
      'campaign-participations.campaignId'
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
      })
  );
  return new OrganizationLearnerActivity({ organizationLearnerId, participations });
}

export { get };
